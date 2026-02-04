package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"upload-service/config"
)

type UploadRequest struct {
	URL string `json:"url"`
}

type UploadResponse struct {
	URL      string `json:"url"`
	FilePath string `json:"file_path"`
}

func UploadFromURL(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req UploadRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.URL == "" {
			http.Error(w, "URL is required", http.StatusBadRequest)
			return
		}

		log.Printf("[UPLOAD] Starting upload from URL: %s", req.URL)

		// 1. Tải ảnh từ URL ngoại vi
		resp, err := http.Get(req.URL)
		if err != nil {
			log.Printf("[UPLOAD ERROR] Failed to download from URL: %v", err)
			http.Error(w, "Failed to download image: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("[UPLOAD ERROR] Download failed with status: %s", resp.Status)
			http.Error(w, "Failed to download image, status: "+resp.Status, http.StatusBadRequest)
			return
		}

		log.Printf("[UPLOAD] Successfully downloaded from URL, status: %s", resp.Status)

		// 2. Xử lý tên file gốc và mã băm (hash) để tránh trùng lặp
		// Lấy phần cuối của URL làm tên file (ví dụ: anh-dep-15.jpg)
		originalName := filepath.Base(req.URL)
		if idx := strings.Index(originalName, "?"); idx != -1 {
			originalName = originalName[:idx] // Loại bỏ các tham số URL nếu có
		}

		ext := filepath.Ext(originalName)
		baseName := strings.TrimSuffix(originalName, ext)
		if baseName == "" {
			baseName = "image"
		}

		// Tạo mã hash ngắn dựa trên timestamp để tránh ghi đè nếu bài post khác trùng tên ảnh
		shortHash := fmt.Sprintf("%x", time.Now().UnixNano())[12:]
		fileName := fmt.Sprintf("%s-%s%s", baseName, shortHash, ext)

		log.Printf("[UPLOAD] Generated filename: %s", fileName)

		// 3. Đảm bảo thư mục đích tồn tại
		log.Printf("[UPLOAD] Ensuring directory exists: %s", cfg.UploadDir)
		if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
			log.Printf("[UPLOAD ERROR] Failed to create directory %s: %v", cfg.UploadDir, err)
			http.Error(w, "Failed to create directory", http.StatusInternalServerError)
			return
		}
		log.Printf("[UPLOAD] Directory exists or created successfully")

		// 4. Lưu file vật lý vào server
		fullPath := filepath.Join(cfg.UploadDir, fileName)
		log.Printf("[UPLOAD] Creating file at: %s", fullPath)

		out, err := os.Create(fullPath)
		if err != nil {
			log.Printf("[UPLOAD ERROR] Failed to create file %s: %v", fullPath, err)
			http.Error(w, "Failed to create file on server", http.StatusInternalServerError)
			return
		}
		defer out.Close()

		bytesWritten, err := io.Copy(out, resp.Body)
		if err != nil {
			log.Printf("[UPLOAD ERROR] Failed to write file content: %v", err)
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		log.Printf("[UPLOAD SUCCESS] File saved successfully: %s (size: %d bytes)", fullPath, bytesWritten)

		// 5. Trả về kết quả theo cấu hình bạn muốn
		// FilePath: Để lưu vào Database (ví dụ: /uploads/anh-dep-15-abc123.jpg)
		relativePath := fmt.Sprintf("/uploads/%s", fileName)

		// Full URL: Trả về cho Frontend hiển thị (ví dụ: https://jobzesty.com/uploads/anh-dep-15-abc123.jpg)
		fullURL := strings.TrimRight(cfg.BaseURL, "/") + relativePath

		log.Printf("[UPLOAD] Returning URL: %s, FilePath: %s", fullURL, relativePath)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UploadResponse{
			URL:      fullURL,
			FilePath: relativePath,
		})
	}
}

func UploadFile(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// 1. Parse Multipart Form (Max 10MB)
		if err := r.ParseMultipartForm(10 << 20); err != nil {
			log.Printf("[UPLOAD ERROR] File too big or invalid form: %v", err)
			http.Error(w, "File too big", http.StatusBadRequest)
			return
		}

		file, header, err := r.FormFile("file")
		if err != nil {
			log.Printf("[UPLOAD ERROR] Error retrieving file: %v", err)
			http.Error(w, "Invalid file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		log.Printf("[UPLOAD] Receiving file upload: %s", header.Filename)

		// 2. Generate filename
		originalName := header.Filename
		ext := filepath.Ext(originalName)
		baseName := strings.TrimSuffix(originalName, ext)
		if baseName == "" {
			baseName = "upload"
		}
		shortHash := fmt.Sprintf("%x", time.Now().UnixNano())[12:]
		fileName := fmt.Sprintf("%s-%s%s", baseName, shortHash, ext)

		// 3. Ensure directory
		if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
			log.Printf("[UPLOAD ERROR] Failed to create directory %s: %v", cfg.UploadDir, err)
			http.Error(w, "Failed to create directory", http.StatusInternalServerError)
			return
		}

		// 4. Save file
		fullPath := filepath.Join(cfg.UploadDir, fileName)
		out, err := os.Create(fullPath)
		if err != nil {
			log.Printf("[UPLOAD ERROR] Failed to create file %s: %v", fullPath, err)
			http.Error(w, "Failed to create file on server", http.StatusInternalServerError)
			return
		}
		defer out.Close()

		bytesWritten, err := io.Copy(out, file)
		if err != nil {
			log.Printf("[UPLOAD ERROR] Failed to write file content: %v", err)
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		log.Printf("[UPLOAD SUCCESS] File saved: %s (%d bytes)", fullPath, bytesWritten)

		// 5. Return response
		relativePath := fmt.Sprintf("/uploads/%s", fileName)
		fullURL := strings.TrimRight(cfg.BaseURL, "/") + relativePath

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(UploadResponse{
			URL:      fullURL,
			FilePath: relativePath,
		})
	}
}
