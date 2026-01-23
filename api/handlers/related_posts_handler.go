package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// GetRelatedPosts trả về các bài viết cùng category, loại trừ bài hiện tại
func GetRelatedPosts(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		
		params := mux.Vars(r)
		
		postID, err := strconv.ParseInt(params["id"], 10, 64)
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		limitParam := r.URL.Query().Get("limit")
		limit := 3
		if limitParam != "" {
			parsedLimit, err := strconv.Atoi(limitParam)
			if err == nil && parsedLimit > 0 && parsedLimit <= 10 {
				limit = parsedLimit
			}
		}


		var currentPost PostModel
		if err := db.Select("category_id").Where("id = ?", postID).First(&currentPost).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Post not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}


		if currentPost.CategoryID == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]PostModel{})
			return
		}



		var relatedPosts []PostModel
		err = db.Model(&PostModel{}).
			Preload("Type").
			Preload("Category").
			Where("category_id = ?", *currentPost.CategoryID).
			Where("id != ?", postID).
			Where("status = ?", "active").
			Order("id DESC").
			Limit(limit).
			Find(&relatedPosts).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}


		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(relatedPosts)
	}
}