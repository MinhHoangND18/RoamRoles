package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PostModel struct {
	ID             int64     `json:"id"`
	Slug           string    `gorm:"column:slug" json:"slug"`
	Content        string    `gorm:"column:content" json:"content"`
	Descrip        string    `gorm:"column:descrip" json:"descrip"`
	Title          string    `gorm:"column:title" json:"title"`
	Excerpt        string    `gorm:"column:excerpt" json:"excerpt"`
	TitleHeader    string    `gorm:"column:title_header" json:"title_header"`
	Status         string    `gorm:"column:status" json:"status"`
	PostNavigation string    `json:"post_navigation"`
	TypeID         int64     `gorm:"column:type_id" json:"type_id"`
	Type           TypeModel `gorm:"foreignKey:TypeID" json:"type"`
}

func (p PostModel) TableName() string {
	return "posts"
}

type PostResponse struct {
	ID             int64     `json:"id"`
	Slug           string    `gorm:"column:slug" json:"slug"`
	Content        string    `gorm:"column:content" json:"content"`
	Descrip        string    `gorm:"column:descrip" json:"descrip"`
	Title          string    `gorm:"column:title" json:"title"`
	Excerpt        string    `gorm:"column:excerpt" json:"excerpt"`
	TitleHeader    string    `gorm:"column:title_header" json:"title_header"`
	Status         string    `gorm:"column:status" json:"status"`
	PostNavigation string    `json:"post_navigation"`
	TypeID         int64     `gorm:"column:type_id" json:"type_id"`
	Type           TypeModel `gorm:"foreignKey:TypeID" json:"type"`
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

func UpdatePostBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		var payload map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result := db.Model(&PostModel{}).Where("slug = ?", slug).Updates(payload)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		if result.RowsAffected == 0 {
			var count int64
			db.Model(&PostModel{}).Where("slug = ?", slug).Count(&count)
			if count == 0 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Post not found."})
				return
			}
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Post updated successfully"})
	}
}