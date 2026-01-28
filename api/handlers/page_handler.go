package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PageModel struct {
	ID      int64  `gorm:"primaryKey" json:"id"`
	Slug    string `gorm:"column:slug;unique;not null" json:"slug"`
	Title   string `gorm:"column:title;not null" json:"title"`
	Content string `gorm:"column:content;type:longtext" json:"content"`
	Status  string `gorm:"column:status;type:enum('active','inactive');default:'active'" json:"status"`
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
		result := db.Where("slug = ?", slug).Where("status = ?", "active").First(&page)

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

		var existingPage PageModel
		if err := db.Where("slug = ?", slug).First(&existingPage).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Page not found with that slug"})
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		result := db.Model(&existingPage).Updates(payload)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
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
		page.ID = 0
		originalSlug := page.Slug
		suffix := 0
		for {
			var count int64
			db.Model(&PageModel{}).Where("slug = ?", page.Slug).Count(&count)
			var countpost int64
			db.Model(&PostModel{}).Where("slug = ?", page.Slug).Count(&countpost)
			var countCategory int64
			db.Model(&CategoryModel{}).Where("slug = ?", page.Slug).Count(&countCategory)
			if count == 0 && countCategory == 0 && countpost == 0 {
				break
			}
			suffix++
			page.Slug = originalSlug + "-" + strconv.Itoa(suffix)
		}

		if err := db.Select("Slug", "Title", "Content", "Status").Create(&page).Error; err != nil {
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