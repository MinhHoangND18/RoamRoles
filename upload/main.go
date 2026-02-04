package main

import (
	"fmt"
	"log"
	"net/http"

	"upload-service/config"
	"upload-service/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// 1. Load Config
	cfg, err := config.LoadConfig(".")
	if err != nil {
		log.Printf("Error loading config: %v", err)
	}

	// 2. Setup Router
	r := mux.NewRouter()

	// API Endpoint
	r.HandleFunc("/api/upload/from-url", handlers.UploadFromURL(cfg)).Methods("POST")
	r.HandleFunc("/api/upload/file", handlers.UploadFile(cfg)).Methods("POST")

	// Serve uploaded files
	// Example: GET /uploads/image-abc123.jpg
	fileServer := http.FileServer(http.Dir(cfg.UploadDir))
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", fileServer))

	// 3. CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	// 4. Start Server
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
	log.Printf("Upload Service running on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
