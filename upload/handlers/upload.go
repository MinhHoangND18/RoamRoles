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

// UploadConfig holds the configuration for uploads
type UploadConfig struct {
	BaseURL       string
	UploadDir     string
	MaxFileSize   int64 // in bytes
	AllowedTypes  []string
}

// UploadFromURLRequest represents the request body for downloading an image from URL
type UploadFromURLRequest struct {
	ImageURL string `json:"image_url"`
}

// UploadResponse represents the response after successful upload
type UploadResponse struct {
	Success     bool   `json:"success"`
	LocalPath   string `json:"local_path"`    // Relative path: uploads/2024/01/filename.jpg
	FullURL     string `json:"full_url"`      // Full URL with domain
	OriginalURL string `json:"original_url"`  // Original URL that was downloaded
	Filename    string `json:"filename"`      // Just the filename
	Size        int64  `json:"size"`          // File size in bytes
	Message     string `json:"message"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

var uploadConfig *UploadConfig

// SetUploadConfig sets the global upload configuration
func SetUploadConfig(config *UploadConfig) {
	uploadConfig = config
}

// GetUploadConfig returns the current upload configuration
func GetUploadConfig() *UploadConfig {
	if uploadConfig == nil {
		return &UploadConfig{
			BaseURL:     "http://localhost:8089",
			UploadDir:   "./uploads",
			MaxFileSize: 10 * 1024 * 1024, // 10MB
			AllowedTypes: []string{
				"image/jpeg", "image/jpg", "image/png",
				"image/gif", "image/webp", "image/svg+xml",
			},
		}
	}
	return uploadConfig
}

// DownloadFromURL handles downloading images from external URLs
func DownloadFromURL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Parse request body
	var req UploadFromURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate URL
	if req.ImageURL == "" {
		sendError(w, "image_url is required", http.StatusBadRequest)
		return
	}

	// Check if URL is valid
	parsedURL, err := url.Parse(req.ImageURL)
	if err != nil || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		sendError(w, "Invalid URL format. Must be http or https", http.StatusBadRequest)
		return
	}

	config := GetUploadConfig()

	// Download the image
	result, err := downloadAndSaveImage(req.ImageURL, config)
	if err != nil {
		sendError(w, fmt.Sprintf("Failed to download image: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

// UploadFile handles direct file uploads via multipart form
func UploadFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	config := GetUploadConfig()

	// Parse multipart form with max size
	if err := r.ParseMultipartForm(config.MaxFileSize); err != nil {
		sendError(w, fmt.Sprintf("File too large or invalid form: %v", err), http.StatusBadRequest)
		return
	}

	// Get the file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		sendError(w, "No file provided. Use 'file' as form field name", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Check file size
	if header.Size > config.MaxFileSize {
		sendError(w, fmt.Sprintf("File too large: %d bytes (max: %d)", header.Size, config.MaxFileSize), http.StatusBadRequest)
		return
	}

	// Check content type
	contentType := header.Header.Get("Content-Type")
	if !isAllowedType(contentType, config.AllowedTypes) {
		sendError(w, fmt.Sprintf("Content type not allowed: %s", contentType), http.StatusBadRequest)
		return
	}

	// Read file content
	content, err := io.ReadAll(file)
	if err != nil {
		sendError(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Generate filename and save
	filename := generateFilename(header.Filename, contentType)
	localPath, fullPath, err := saveFile(content, filename, config)
	if err != nil {
		sendError(w, fmt.Sprintf("Failed to save file: %v", err), http.StatusInternalServerError)
		return
	}

	// Get file info
	fileInfo, _ := os.Stat(fullPath)
	fileSize := int64(0)
	if fileInfo != nil {
		fileSize = fileInfo.Size()
	}

	response := UploadResponse{
		Success:   true,
		LocalPath: localPath,
		FullURL:   fmt.Sprintf("%s/%s", strings.TrimSuffix(config.BaseURL, "/"), localPath),
		Filename:  filename,
		Size:      fileSize,
		Message:   "File uploaded successfully",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// HealthCheck returns the health status of the service
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "healthy",
		"service": "upload-service",
		"version": "1.0.0",
	})
}

// downloadAndSaveImage downloads an image from URL and saves it
func downloadAndSaveImage(imageURL string, config *UploadConfig) (*UploadResponse, error) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Make request
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers to mimic browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Accept", "image/*")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to download: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("server returned status: %d", resp.StatusCode)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !isAllowedType(contentType, config.AllowedTypes) {
		return nil, fmt.Errorf("content type not allowed: %s", contentType)
	}

	// Check content length
	if resp.ContentLength > config.MaxFileSize {
		return nil, fmt.Errorf("file too large: %d bytes (max: %d)", resp.ContentLength, config.MaxFileSize)
	}

	// Read body with size limit
	body, err := io.ReadAll(io.LimitReader(resp.Body, config.MaxFileSize))
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Generate filename
	filename := generateFilename(imageURL, contentType)

	// Save file
	localPath, fullPath, err := saveFile(body, filename, config)
	if err != nil {
		return nil, err
	}

	// Get file info
	fileInfo, _ := os.Stat(fullPath)
	fileSize := int64(0)
	if fileInfo != nil {
		fileSize = fileInfo.Size()
	}

	return &UploadResponse{
		Success:     true,
		LocalPath:   localPath,
		FullURL:     fmt.Sprintf("%s/%s", strings.TrimSuffix(config.BaseURL, "/"), localPath),
		OriginalURL: imageURL,
		Filename:    filename,
		Size:        fileSize,
		Message:     "Image downloaded and saved successfully",
	}, nil
}

// saveFile saves content to the uploads directory
func saveFile(content []byte, filename string, config *UploadConfig) (string, string, error) {
	// Create directory structure: uploads/YYYY/MM/
	now := time.Now()
	yearDir := fmt.Sprintf("%02d", now.Year()%100)
	monthDir := fmt.Sprintf("%02d", now.Month())

	relativeDir := filepath.Join("uploads", yearDir, monthDir)
	fullDir := filepath.Join(config.UploadDir, yearDir, monthDir)

	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create directory: %w", err)
	}

	fullPath := filepath.Join(fullDir, filename)
	relativePath := filepath.Join(relativeDir, filename)

	// Check if file exists
	if _, err := os.Stat(fullPath); err == nil {
		return strings.ReplaceAll(relativePath, "\\", "/"), fullPath, nil
	}

	// Save file
	if err := os.WriteFile(fullPath, content, 0644); err != nil {
		return "", "", fmt.Errorf("failed to save file: %w", err)
	}

	return strings.ReplaceAll(relativePath, "\\", "/"), fullPath, nil
}

// generateFilename creates a unique filename
func generateFilename(source string, contentType string) string {
	// Try to extract original filename
	var originalName string
	if parsedURL, err := url.Parse(source); err == nil && parsedURL.Scheme != "" {
		originalName = filepath.Base(parsedURL.Path)
		if idx := strings.Index(originalName, "?"); idx != -1 {
			originalName = originalName[:idx]
		}
	} else {
		originalName = source
	}

	// Clean filename
	originalName = sanitizeFilename(originalName)

	// Get extension
	ext := filepath.Ext(originalName)
	if ext == "" {
		ext = getExtensionFromContentType(contentType)
	}

	// Get base name
	baseName := strings.TrimSuffix(originalName, ext)
	if baseName == "" {
		baseName = "image"
	}
	if len(baseName) > 50 {
		baseName = baseName[:50]
	}

	// Create hash for uniqueness
	hash := md5.Sum([]byte(source + time.Now().String()))
	hashStr := hex.EncodeToString(hash[:])[:8]

	return fmt.Sprintf("%s-%s%s", baseName, hashStr, ext)
}

// sanitizeFilename removes invalid characters
func sanitizeFilename(name string) string {
	reg := regexp.MustCompile(`[<>:"/\\|?*\x00-\x1f]`)
	name = reg.ReplaceAllString(name, "_")
	name = strings.ReplaceAll(name, " ", "-")
	reg = regexp.MustCompile(`[-_]+`)
	name = reg.ReplaceAllString(name, "-")
	return strings.ToLower(strings.Trim(name, "-_"))
}

// getExtensionFromContentType returns file extension based on content type
func getExtensionFromContentType(contentType string) string {
	switch {
	case strings.Contains(contentType, "jpeg"), strings.Contains(contentType, "jpg"):
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

// isAllowedType checks if content type is allowed
func isAllowedType(contentType string, allowedTypes []string) bool {
	for _, allowed := range allowedTypes {
		if strings.Contains(contentType, strings.TrimPrefix(allowed, "image/")) {
			return true
		}
	}
	return false
}

// sendError sends a JSON error response
func sendError(w http.ResponseWriter, message string, statusCode int) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   message,
	})
}
