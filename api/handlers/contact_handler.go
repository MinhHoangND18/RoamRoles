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

type User struct {
	ID int64 `gorm:"primaryKey"`

	FirstName string `gorm:"column:first_name;type:varchar(100)"`
	LastName  string `gorm:"column:last_name;type:varchar(100)"`
	Email     string `gorm:"column:email;type:varchar(255)"`
	Message   string `gorm:"column:message;type:text"`

	Status string `gorm:"column:status;type:enum('new','contacted');default:'new'"`

	IP        string `gorm:"column:ip;type:varchar(45)"`
	IPVersion string `gorm:"column:ip_version;type:enum('ipv4','ipv6')"`
	UserAgent string `gorm:"column:user_agent;type:text"`
	Browser   string `gorm:"column:browser;type:varchar(50)"`
	OS        string `gorm:"column:os;type:varchar(50)"`
	Device    string `gorm:"column:device;type:enum('desktop','mobile','tablet','bot','unknown')"`

	CountryCode string `gorm:"column:country_code;type:char(2)"`
	Country     string `gorm:"column:country;type:varchar(50)"`
	City        string `gorm:"column:city;type:varchar(100)"`
	Timezone    string `gorm:"column:timezone;type:varchar(50)"`

	Referer string `gorm:"column:referer;type:text"`
	Domain  string `gorm:"column:domain;type:text"`
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

		user := User{
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

			CountryCode: "",
			Country:     "",
			City:        "",
			Timezone:    "",

			Referer: referer,
			Domain:  domain,
		}

		if err := db.Create(&user).Error; err != nil {
			http.Error(w, "Failed to save contact", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"message": "Contact saved",
			"data":    user,
		})
	}
}
