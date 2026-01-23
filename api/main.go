package main

import (
	"fmt"
	"log"
	"net/http"

	"roamroles-api/config"
	"roamroles-api/handlers"

	gorillahandlers "github.com/gorilla/handlers"
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

	r.HandleFunc("/api/posts", handlers.GetPosts(DB)).Methods("GET")
	r.HandleFunc("/api/posts", handlers.CreatePost(DB)).Methods("POST")
	r.HandleFunc("/api/posts/check-slug", handlers.CheckSlugUniqueness(DB)).Methods("GET")
	r.HandleFunc("/api/posts/{id:[0-9]+}", handlers.GetPostById(DB)).Methods("GET")
	r.HandleFunc("/api/posts/{id:[0-9]+}", handlers.UpdatePostById(DB)).Methods("PUT")
	r.HandleFunc("/api/posts/{slug}", handlers.GetPostBySlug(DB)).Methods("GET")

	r.HandleFunc("/api/types", handlers.GetTypes(DB)).Methods("GET")
	r.HandleFunc("/api/types/{slug}", handlers.GetTypeBySlug(DB)).Methods("GET")

	r.HandleFunc("/api/accounts", handlers.GetAccounts(DB)).Methods("GET")
	r.HandleFunc("/api/accounts", handlers.CreateAccount(DB)).Methods("POST")
	r.HandleFunc("/api/check-access", handlers.CheckAccess(DB)).Methods("GET")
	r.HandleFunc("/api/accounts/{id:[0-9]+}", handlers.GetAccountByID(DB)).Methods("GET")
	r.HandleFunc("/api/accounts/{id:[0-9]+}", handlers.UpdateAccount(DB)).Methods("PUT")

	r.HandleFunc("/api/contact", handlers.ContactHandler(DB)).Methods("POST")

	r.HandleFunc("/api/pages/check-slug", handlers.CheckPageSlugUniqueness(DB)).Methods("GET")
	r.HandleFunc("/api/pages", handlers.GetPages(DB)).Methods("GET")
	r.HandleFunc("/api/pages", handlers.CreatePage(DB)).Methods("POST")
	r.HandleFunc("/api/pages/{slug}", handlers.GetPageBySlug(DB)).Methods("GET")
	r.HandleFunc("/api/pages/{slug}", handlers.UpdatePageBySlug(DB)).Methods("PUT")

	r.HandleFunc("/api/categories", handlers.GetCategories(DB)).Methods("GET")
	r.HandleFunc("/api/categories/{slug}", handlers.GetCategoryBySlug(DB)).Methods("GET")
	r.HandleFunc("/api/categories/handle", handlers.HandleCategory(DB)).Methods("POST")
	r.HandleFunc("/api/categories/handle/{id:[0-9]+}", handlers.HandleCategory(DB)).Methods("POST")
	r.HandleFunc("/api/categories/{slug}/posts", handlers.GetPostsByCategorySlug(DB)).Methods("GET")

	corsHandler := gorillahandlers.CORS(
		gorillahandlers.AllowedOrigins([]string{"*"}),
		gorillahandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}),
		gorillahandlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With"}),
	)

	sv := fmt.Sprintf("%v:%v", "127.0.0.1", cf.Port)
	log.Println(" Server running at http://", sv)
	log.Fatal(http.ListenAndServe(sv, corsHandler(r)))
	log.Printf("Listening on http://%s", sv)

}