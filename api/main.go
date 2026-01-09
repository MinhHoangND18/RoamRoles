package main

import (
	"log"
	"net/http"

	apiHandlers "roamroles-api/handlers"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	InitDB()

	r := mux.NewRouter()

	r.HandleFunc("/api/posts/{slug}", apiHandlers.GetPostBySlug(DB)).Methods("GET")

	// Add CORS middleware
	allowedOrigins := handlers.AllowedOrigins([]string{"http://localhost:3000"})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type"})

	log.Println("🚀 Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r)))
}
