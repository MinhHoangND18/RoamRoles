package handlers

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"
)

type ContactModel struct {
	ID        int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	FirstName string `gorm:"column:first_name" json:"first_name"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
	Email     string `gorm:"column:email" json:"email"`
	Message   string `gorm:"column:message;type:text" json:"message"`
	Status    string `gorm:"column:status;type:enum('new','contacted');default:'new'" json:"status"`

	IP        string `gorm:"column:ip" json:"ip"`
	IPVersion string `gorm:"column:ip_version;type:enum('ipv4','ipv6')" json:"ip_version"`
	UserAgent string `gorm:"column:user_agent;type:text" json:"user_agent"`
	Browser   string `gorm:"column:browser" json:"browser"`
	OS        string `gorm:"column:os" json:"os"`
	Device    string `gorm:"column:device;type:enum('desktop','mobile','tablet','bot','unknown')" json:"device"`

	CountryCode string `gorm:"column:country_code" json:"country_code"`
	Country     string `gorm:"column:country" json:"country"`
	City        string `gorm:"column:city" json:"city"`
	Timezone    string `gorm:"column:timezone" json:"timezone"`

	Referer string `gorm:"column:referer;type:text" json:"referer"`
	Domain  string `gorm:"column:domain;type:text" json:"domain"`
}

func (ContactModel) TableName() string {
	return "users"
}

type ContactRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Message   string `json:"message"`
}

type GeoIPResponse struct {
	CountryCode string `json:"countryCode"`
	Country     string `json:"country"`
	City        string `json:"city"`
	Timezone    string `json:"timezone"`
	Status      string `json:"status"`
	Message     string `json:"message"`
}

func CreateContact(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req ContactRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if req.Email == "" || req.Message == "" {
			http.Error(w, "Email and message are required", http.StatusBadRequest)
			return
		}

		contact := ContactModel{
			FirstName: req.FirstName,
			LastName:  req.LastName,
			Email:     req.Email,
			Message:   req.Message,
			Status:    "new",
		}

		// Get client IP
		contact.IP = getClientIP(r)
		contact.IPVersion = getIPVersion(contact.IP)

		// Get geolocation data from IP
		geoData := getGeoLocation(contact.IP)
		contact.CountryCode = geoData.CountryCode
		contact.Country = geoData.Country
		contact.City = geoData.City
		contact.Timezone = geoData.Timezone

		// Get user agent
		contact.UserAgent = r.UserAgent()
		contact.Browser = parseBrowser(contact.UserAgent)
		contact.OS = parseOS(contact.UserAgent)
		contact.Device = parseDevice(contact.UserAgent)

		// Get referer and domain
		contact.Referer = r.Referer()
		if contact.Referer != "" {
			contact.Domain = extractDomain(contact.Referer)
		}

		// Save to database
		if err := db.Create(&contact).Error; err != nil {
			http.Error(w, "Failed to save contact", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Contact form submitted successfully",
			"id":      contact.ID,
		})
	}
}

func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		ips := strings.Split(xff, ",")
		return strings.TrimSpace(ips[0])
	}

	// Check X-Real-IP header
	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		return xri
	}

	// Use RemoteAddr
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	return ip
}

func getIPVersion(ip string) string {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return ""
	}
	if parsedIP.To4() != nil {
		return "ipv4"
	}
	return "ipv6"
}

func parseBrowser(ua string) string {
	ua = strings.ToLower(ua)
	switch {
	case strings.Contains(ua, "edg/"):
		return "Edge"
	case strings.Contains(ua, "chrome/"):
		return "Chrome"
	case strings.Contains(ua, "safari/") && !strings.Contains(ua, "chrome"):
		return "Safari"
	case strings.Contains(ua, "firefox/"):
		return "Firefox"
	case strings.Contains(ua, "opera/") || strings.Contains(ua, "opr/"):
		return "Opera"
	default:
		return "Unknown"
	}
}

func parseOS(ua string) string {
	ua = strings.ToLower(ua)
	switch {
	case strings.Contains(ua, "windows"):
		return "Windows"
	case strings.Contains(ua, "mac"):
		return "macOS"
	case strings.Contains(ua, "linux"):
		return "Linux"
	case strings.Contains(ua, "android"):
		return "Android"
	case strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad"):
		return "iOS"
	default:
		return "Unknown"
	}
}

func parseDevice(ua string) string {
	ua = strings.ToLower(ua)
	switch {
	case strings.Contains(ua, "bot") || strings.Contains(ua, "crawler") || strings.Contains(ua, "spider"):
		return "bot"
	case strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone"):
		return "mobile"
	case strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad"):
		return "tablet"
	case strings.Contains(ua, "windows") || strings.Contains(ua, "mac") || strings.Contains(ua, "linux"):
		return "desktop"
	default:
		return "unknown"
	}
}

func extractDomain(referer string) string {
	if !strings.HasPrefix(referer, "http://") && !strings.HasPrefix(referer, "https://") {
		return referer
	}
	parts := strings.Split(referer, "/")
	if len(parts) >= 3 {
		return parts[2]
	}
	return referer
}

func getGeoLocation(ip string) GeoIPResponse {
	// Skip geolocation for local IPs
	if ip == "" || ip == "127.0.0.1" || ip == "::1" || strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") {
		return GeoIPResponse{}
	}

	// Use ip-api.com free service (limit: 45 requests per minute)
	url := "http://ip-api.com/json/" + ip + "?fields=status,message,country,countryCode,city,timezone"

	client := &http.Client{
		Timeout: 3 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return GeoIPResponse{}
	}
	defer resp.Body.Close()

	var geoData GeoIPResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoData); err != nil {
		return GeoIPResponse{}
	}

	// Check if the request was successful
	if geoData.Status != "success" {
		return GeoIPResponse{}
	}

	return geoData
}
