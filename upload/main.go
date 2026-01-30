package main

import (
	"fmt"
	"log"
	"net/http"

	"upload-service/config"
	"upload-service/handlers"

	gorillahandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("Cannot load config:", err)
	}

	// Set upload configuration
	handlers.SetUploadConfig(&handlers.UploadConfig{
		BaseURL:     cfg.BaseURL,
		UploadDir:   cfg.UploadDir,
		MaxFileSize: cfg.MaxFileSizeMB * 1024 * 1024, // Convert MB to bytes
		AllowedTypes: []string{
			"image/jpeg", "image/jpg", "image/png",
			"image/gif", "image/webp", "image/svg+xml",
		},
	})

	// Create router
	r := mux.NewRouter()

	// Health check endpoint
	r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Upload endpoints
	r.HandleFunc("/api/upload/from-url", handlers.DownloadFromURL).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/upload/file", handlers.UploadFile).Methods("POST", "OPTIONS")

	// Serve uploaded files statically
	// Access files like: http://localhost:8089/uploads/24/01/image.jpg
	r.PathPrefix("/uploads/").Handler(
		http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))),
	)

	// CORS configuration
	corsHandler := gorillahandlers.CORS(
		gorillahandlers.AllowedOrigins(cfg.AllowedOrigins),
		gorillahandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}),
		gorillahandlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With", "Authorization"}),
	)

	// Server address
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	log.Println("===========================================")
	log.Println("  Upload Service Started")
	log.Println("===========================================")
	log.Printf("  Server:     http://%s\n", addr)
	log.Printf("  Base URL:   %s\n", cfg.BaseURL)
	log.Printf("  Upload Dir: %s\n", cfg.UploadDir)
	log.Printf("  Max Size:   %d MB\n", cfg.MaxFileSizeMB)
	log.Println("===========================================")
	log.Println("  Endpoints:")
	log.Println("    GET  /health              - Health check")
	log.Println("    POST /api/upload/from-url - Download from URL")
	log.Println("    POST /api/upload/file     - Upload file directly")
	log.Println("    GET  /uploads/*           - Serve uploaded files")
	log.Println("===========================================")

	log.Fatal(http.ListenAndServe(addr, corsHandler(r)))
}
