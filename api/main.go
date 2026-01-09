package main

import (
	"log"
	"net/http"

	"roamroles-api/handlers"

	"github.com/gorilla/mux"
)

func main() {
	InitDB()

	r := mux.NewRouter()

	r.HandleFunc("/api/posts/{slug}", handlers.GetPostBySlug(DB)).Methods("GET")

	log.Println("🚀 Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
