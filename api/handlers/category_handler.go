package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CategoryModel struct {
	ID          int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug        string `gorm:"column:slug;unique;not null" json:"slug"`
	Title       string `gorm:"column:title;not null" json:"title"`
	TitleHeader string `gorm:"column:title_header" json:"title_header"`
	Status      string `gorm:"column:status;type:enum('active','inactive');default:'active'" json:"status"`
}

func (c CategoryModel) TableName() string {
	return "categories"
}

func GetCategories(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var categories []CategoryModel
		err := db.Order("id DESC").Find(&categories).Error
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(categories)
	}
}

func GetCategoryBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]

		var category CategoryModel
		result := db.Where("slug = ?", slug).First(&category)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Category not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(category)
	}
}

func HandleCategory(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		idParam := params["id"] 

		var category CategoryModel
		if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if idParam != "" && idParam != "0" {
			id, _ := strconv.ParseInt(idParam, 10, 64)
			result := db.Model(&CategoryModel{}).Where("id = ?", id).Updates(category)
			if result.Error != nil {
				http.Error(w, result.Error.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Category updated successfully"})
		} else {
			originalSlug := category.Slug
			suffix := 0
			for {
				var count int64
				db.Model(&CategoryModel{}).Where("slug = ?", category.Slug).Count(&count)
				if count == 0 {
					break
				}
				suffix++
				category.Slug = originalSlug + "-" + strconv.Itoa(suffix)
			}

			if err := db.Create(&category).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(category)
		}
	}
}