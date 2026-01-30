package handlers

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// UploadRequest represents the request body for downloading an image from URL
type UploadRequest struct {
	ImageURL string `json:"image_url"`
}

// UploadResponse represents the response after successful upload
type UploadResponse struct {
	Success      bool   `json:"success"`
	LocalPath    string `json:"local_path"`     // Relative path: uploads/2024/01/filename.jpg
	FullURL      string `json:"full_url"`       // Full URL with domain: https://jobzestry.com/uploads/2024/01/filename.jpg
	OriginalURL  string `json:"original_url"`   // Original URL that was downloaded
	Message      string `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// Config for upload - you should load these from environment variables
type UploadConfig struct {
	BaseURL       string // e.g., "https://jobzestry.com"
	UploadDir     string // e.g., "./uploads" or "/var/www/uploads"
	MaxFileSize   int64  // Max file size in bytes (e.g., 10MB = 10 * 1024 * 1024)
	AllowedTypes  []string
}

// GetUploadConfig returns the upload configuration
// TODO: Load from environment variables in production
func GetUploadConfig() UploadConfig {
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "https://jobzestry.com"
	}
	
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	
	return UploadConfig{
		BaseURL:     baseURL,
		UploadDir:   uploadDir,
		MaxFileSize: 10 * 1024 * 1024, // 10MB
		AllowedTypes: []string{
			"image/jpeg",
			"image/jpg", 
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		},
	}
}

// DownloadAndSaveImage handles the API endpoint for downloading images from external URLs
func DownloadAndSaveImage() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		// Parse request body
		var req UploadRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			sendErrorResponse(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		
		// Validate URL
		if req.ImageURL == "" {
			sendErrorResponse(w, "image_url is required", http.StatusBadRequest)
			return
		}
		
		// Check if URL is valid
		parsedURL, err := url.Parse(req.ImageURL)
		if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
			sendErrorResponse(w, "Invalid URL format", http.StatusBadRequest)
			return
		}
		
		config := GetUploadConfig()
		
		// Download the image
		localPath, err := downloadImage(req.ImageURL, config)
		if err != nil {
			sendErrorResponse(w, fmt.Sprintf("Failed to download image: %v", err), http.StatusInternalServerError)
			return
		}
		
		// Build full URL
		fullURL := fmt.Sprintf("%s/%s", strings.TrimSuffix(config.BaseURL, "/"), localPath)
		
		response := UploadResponse{
			Success:     true,
			LocalPath:   localPath,
			FullURL:     fullURL,
			OriginalURL: req.ImageURL,
			Message:     "Image downloaded and saved successfully",
		}
		
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
}

// downloadImage downloads an image from URL and saves it to the uploads directory
func downloadImage(imageURL string, config UploadConfig) (string, error) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	
	// Make request with proper headers
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers to mimic a browser request
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept", "image/*")
	
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to download: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server returned status: %d", resp.StatusCode)
	}
	
	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !isAllowedContentType(contentType, config.AllowedTypes) {
		return "", fmt.Errorf("content type not allowed: %s", contentType)
	}
	
	// Check content length
	if resp.ContentLength > config.MaxFileSize {
		return "", fmt.Errorf("file too large: %d bytes (max: %d)", resp.ContentLength, config.MaxFileSize)
	}
	
	// Read body with size limit
	body, err := io.ReadAll(io.LimitReader(resp.Body, config.MaxFileSize))
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}
	
	// Generate filename
	filename := generateFilename(imageURL, contentType)
	
	// Create directory structure: uploads/YYYY/MM/
	now := time.Now()
	relativeDir := filepath.Join("uploads", fmt.Sprintf("%02d", now.Year()%100), fmt.Sprintf("%02d", now.Month()))
	fullDir := filepath.Join(config.UploadDir, fmt.Sprintf("%02d", now.Year()%100), fmt.Sprintf("%02d", now.Month()))
	
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}
	
	// Full path for the file
	fullPath := filepath.Join(fullDir, filename)
	relativePath := filepath.Join(relativeDir, filename)
	
	// Check if file already exists (avoid duplicates)
	if _, err := os.Stat(fullPath); err == nil {
		// File exists, return existing path
		return strings.ReplaceAll(relativePath, "\\", "/"), nil
	}
	
	// Save file
	if err := os.WriteFile(fullPath, body, 0644); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}
	
	// Return path with forward slashes for URLs
	return strings.ReplaceAll(relativePath, "\\", "/"), nil
}

// generateFilename creates a unique filename from the URL and content type
func generateFilename(imageURL string, contentType string) string {
	// Extract original filename from URL
	parsedURL, _ := url.Parse(imageURL)
	originalName := filepath.Base(parsedURL.Path)
	
	// Remove query parameters from filename
	if idx := strings.Index(originalName, "?"); idx != -1 {
		originalName = originalName[:idx]
	}
	
	// Clean the filename
	originalName = sanitizeFilename(originalName)
	
	// Get extension from content type if original doesn't have one
	ext := filepath.Ext(originalName)
	if ext == "" {
		ext = getExtensionFromContentType(contentType)
	}
	
	// Get base name without extension
	baseName := strings.TrimSuffix(originalName, ext)
	if baseName == "" {
		baseName = "image"
	}
	
	// Limit base name length
	if len(baseName) > 50 {
		baseName = baseName[:50]
	}
	
	// Create hash from URL for uniqueness
	hash := md5.Sum([]byte(imageURL))
	hashStr := hex.EncodeToString(hash[:])[:8]
	
	return fmt.Sprintf("%s-%s%s", baseName, hashStr, ext)
}

// sanitizeFilename removes invalid characters from filename
func sanitizeFilename(name string) string {
	// Replace invalid characters with underscore
	reg := regexp.MustCompile(`[<>:"/\\|?*\x00-\x1f]`)
	name = reg.ReplaceAllString(name, "_")
	
	// Replace spaces with hyphens
	name = strings.ReplaceAll(name, " ", "-")
	
	// Remove consecutive hyphens/underscores
	reg = regexp.MustCompile(`[-_]+`)
	name = reg.ReplaceAllString(name, "-")
	
	return strings.ToLower(strings.Trim(name, "-_"))
}

// getExtensionFromContentType returns file extension based on content type
func getExtensionFromContentType(contentType string) string {
	switch {
	case strings.Contains(contentType, "jpeg") || strings.Contains(contentType, "jpg"):
		return ".jpg"
	case strings.Contains(contentType, "png"):
		return ".png"
	case strings.Contains(contentType, "gif"):
		return ".gif"
	case strings.Contains(contentType, "webp"):
		return ".webp"
	case strings.Contains(contentType, "svg"):
		return ".svg"
	default:
		return ".jpg"
	}
}

// isAllowedContentType checks if the content type is in the allowed list
func isAllowedContentType(contentType string, allowedTypes []string) bool {
	for _, allowed := range allowedTypes {
		if strings.Contains(contentType, strings.TrimPrefix(allowed, "image/")) {
			return true
		}
	}
	return false
}

// sendErrorResponse sends a JSON error response
func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   message,
	})
}
