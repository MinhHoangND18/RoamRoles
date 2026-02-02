package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	Host           string
	BaseURL        string
	UploadDir      string
	MaxFileSizeMB  int64
	AllowedOrigins []string
}

func LoadConfig(path string) (*Config, error) {
	err := godotenv.Load(path + "/.env")
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	host := os.Getenv("HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8089"
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	maxFileSizeStr := os.Getenv("MAX_FILE_SIZE_MB")
	maxFileSizeMB := int64(100)
	if maxFileSizeStr != "" {
		if size, err := strconv.ParseInt(maxFileSizeStr, 10, 64); err == nil {
			maxFileSizeMB = size
		}
	}

	allowedOriginsStr := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if allowedOriginsStr == "" || allowedOriginsStr == "*" {
		allowedOrigins = []string{"*"}
	} else {
		allowedOrigins = strings.Split(allowedOriginsStr, ",")
		for i := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
		}
	}

	return &Config{
		Port:           port,
		Host:           host,
		BaseURL:        baseURL,
		UploadDir:      uploadDir,
		MaxFileSizeMB:  maxFileSizeMB,
		AllowedOrigins: allowedOrigins,
	}, nil
}
