package handlers

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"

	"github.com/mssola/useragent"
	"gorm.io/gorm"
)

type ContactRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Message   string `json:"message"`
}

type ContactModel struct {
	ID int64 `gorm:"primaryKey;autoIncrement" json:"id"`

	FirstName string `gorm:"column:first_name;type:varchar(100)" json:"first_name"`
	LastName  string `gorm:"column:last_name;type:varchar(100)" json:"last_name"`
	Email     string `gorm:"column:email;type:varchar(255)" json:"email"`
	Message   string `gorm:"column:message;type:text" json:"message"`

	Status string `gorm:"column:status;type:enum('new','contacted');default:'new'" json:"status"`

	IP        string `gorm:"column:ip;type:varchar(45)" json:"ip"`
	IPVersion string `gorm:"column:ip_version;type:enum('ipv4','ipv6')" json:"ip_version"`
	UserAgent string `gorm:"column:user_agent;type:text" json:"user_agent"`
	Browser   string `gorm:"column:browser;type:varchar(50)" json:"browser"`
	OS        string `gorm:"column:os;type:varchar(50)" json:"os"`
	Device    string `gorm:"column:device;type:enum('desktop','mobile','tablet','bot','unknown')" json:"device"`

	Referer string `gorm:"column:referer;type:text" json:"referer"`
	Domain  string `gorm:"column:domain;type:text" json:"domain"`
}

func (ContactModel) TableName() string {
	return "contacts"
}

// ===== Helpers =====

func getClientIP(r *http.Request) string {
	ip := r.Header.Get("CF-Connecting-IP")
	if ip != "" {
		return ip
	}

	ip = r.Header.Get("X-Forwarded-For")
	if ip != "" {
		parts := strings.Split(ip, ",")
		return strings.TrimSpace(parts[0])
	}

	ip = r.Header.Get("X-Real-IP")
	if ip != "" {
		return ip
	}

	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func detectIPVersion(ip string) string {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return "ipv4"
	}
	if parsed.To4() != nil {
		return "ipv4"
	}
	return "ipv6"
}

func parseUserAgent(ua string) (browser, os, device string) {
	userAgent := useragent.New(ua)

	browserName, _ := userAgent.Browser()
	os = userAgent.OS()

	switch {
	case userAgent.Bot():
		device = "bot"
	case userAgent.Mobile():
		device = "mobile"
	default:
		device = "desktop"
	}

	browser = browserName
	return
}

func ContactHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var req ContactRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON body", http.StatusBadRequest)
			return
		}

		if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Message == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		ip := getClientIP(r)
		ipVersion := detectIPVersion(ip)

		ua := r.Header.Get("User-Agent")
		browser, osName, device := parseUserAgent(ua)

		referer := r.Header.Get("Referer")
		domain := r.Host

		contact := ContactModel{
			FirstName: req.FirstName,
			LastName:  req.LastName,
			Email:     req.Email,
			Message:   req.Message,

			Status: "new",

			IP:        ip,
			IPVersion: ipVersion,
			UserAgent: ua,
			Browser:   browser,
			OS:        osName,
			Device:    device,

			Referer: referer,
			Domain:  domain,
		}

		if err := db.Create(&contact).Error; err != nil {
			http.Error(w, "Failed to save contact", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Contact saved",
			"data":    contact,
		})
	}
}

func GetContacts(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var contacts []ContactModel
		if err := db.Order("id DESC").Find(&contacts).Error; err != nil {
			http.Error(w, "Failed to fetch contacts", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(contacts)
	}
}
