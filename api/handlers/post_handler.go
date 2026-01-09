package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)
type PostResponse struct {
	ID          int64           `json:"id"`
	Slug        string          `json:"slug"`
	Company     string          `json:"company"`
	Title       string          `json:"title"`
	Content     json.RawMessage `json:"content"`
	PublishedAt string          `json:"published_at"`
}

func GetPostBySlug(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]

		var post PostResponse

		err := db.QueryRow(`
			SELECT id, slug, company, title, content, published_at
			FROM posts
			WHERE slug = ?
		`, slug).Scan(
			&post.ID,
			&post.Slug,
			&post.Company,
			&post.Title,
			&post.Content,
			&post.PublishedAt,
		)

		if err == sql.ErrNoRows {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
}
