package main

import (
	"fmt"
	"log"
	"net/http"

	"roamroles-api/config"
	"roamroles-api/handlers"

	"github.com/gorilla/mux"
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
	r.HandleFunc("/api", handlers.GetPosts(DB)).Methods("GET")
	r.HandleFunc("/api/", handlers.GetPosts(DB)).Methods("GET")
	r.HandleFunc("/api/{slug}", handlers.GetPostBySlug(DB)).Methods("GET")
	sv := fmt.Sprintf("%v:%v", "127.0.0.1", cf.Port)
	log.Println("🚀 Server running at http://", sv)
	log.Fatal(http.ListenAndServe(sv, r))
}
