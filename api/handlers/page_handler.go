package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PageModel struct {
	ID          int64  `gorm:"primaryKey" json:"id"`
	Slug        string `gorm:"column:slug;unique;not null" json:"slug"`
	Title       string `gorm:"column:title;not null" json:"title"`
	TitleHeader string `gorm:"column:title_header" json:"title_header"`
	Content     string `gorm:"column:content;type:longtext" json:"content"`
	Status      string `gorm:"column:status;type:enum('active','inactive');default:'active'" json:"status"`
}

func (p PageModel) TableName() string {
	return "pages"
}

func GetPages(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var pages []PageModel
		err := db.Model(&PageModel{}).Order("id DESC").Find(&pages).Error
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(pages)
	}
}

func GetPageBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		var page PageModel
		result := db.Where("slug = ?", slug).First(&page)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Page not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(page)
	}
}

func UpdatePageBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		
		var payload map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result := db.Model(&PageModel{}).Where("slug = ?", slug).Updates(payload)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		if result.RowsAffected == 0 {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"message": "Page not found"})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Page updated successfully"})
	}
}

func CreatePage(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var page PageModel
		if err := json.NewDecoder(r.Body).Decode(&page); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		originalSlug := page.Slug
		suffix := 0
		for {
			var count int64
			db.Model(&PageModel{}).Where("slug = ?", page.Slug).Count(&count)
			if count == 0 {
				break
			}
			suffix++
			page.Slug = originalSlug + "-" + strconv.Itoa(suffix)
		}

		if err := db.Create(&page).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(page)
	}
}

func CheckPageSlugUniqueness(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := r.URL.Query().Get("slug")
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		var count int64
		db.Model(&PageModel{}).Where("slug = ?", slug).Count(&count)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"exists": count > 0})
	}
}