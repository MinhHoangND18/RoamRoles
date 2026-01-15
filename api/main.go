package main

import (
	"fmt"
	"log"
	"net/http"

	"roamroles-api/config"
	"roamroles-api/handlers"

	"github.com/gorilla/mux"
	gorillahandlers "github.com/gorilla/handlers"
)

func main() {
	cf, err := config.LoadConfig(".")
	if err != nil {
		log.Fatal("cannot load config:", err)
	}

	DB, err := config.InitDB(cf.DbUrl)
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}
	r := mux.NewRouter()
	r.HandleFunc("/api/posts", handlers.GetPosts(DB)).Methods("GET")
	r.HandleFunc("/api/posts/{slug}", handlers.GetPostBySlug(DB)).Methods("GET")
	r.HandleFunc("/api/posts/{slug}", handlers.UpdatePostBySlug(DB)).Methods("PUT")
	r.HandleFunc("/api/types", handlers.GetTypes(DB)).Methods("GET")
	r.HandleFunc("/api/types/{slug}", handlers.GetTypeBySlug(DB)).Methods("GET")

	

	corsHandler := gorillahandlers.CORS(
		gorillahandlers.AllowedOrigins([]string{"http://localhost:3000", "http://localhost:3001"}),
		gorillahandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}),
		gorillahandlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With"}),
	)

	sv := fmt.Sprintf("%v:%v", "127.0.0.1", cf.Port)
	log.Println("🚀 Server running at http://", sv)
	log.Fatal(http.ListenAndServe(sv, corsHandler(r)))
}
