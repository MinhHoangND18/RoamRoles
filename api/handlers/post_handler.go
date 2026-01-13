package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PostModel struct {
	ID             int64  `json:"id"`
	Slug           string `gorm:"column:slug" json:"slug"`
	Content        string `gorm:"column:content" json:"content"`
	HeadingTitle   string `json:"heading_title"`
	PostNavigation string `json:"post_navigation"`
}

func (p PostModel) TableName() string {
	return "posts"
}

type PostResponse struct {
	ID             int64  `json:"id" gorm:"cloiu"`
	Slug           string `json:"slug"`
	Content        string `json:"content"`
	HeadingTitle   string `json:"heading_title"`
	PostNavigation string `json:"post_navigation"`
}

func GetPostBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}
		post := PostModel{}
		result := db.Model(&PostModel{}).Where("slug = ?", slug).First(&post)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Post not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
}

func GetPosts(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		post := []PostModel{}
		err := db.Model(&PostModel{}).Find(&post).Error
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
}
