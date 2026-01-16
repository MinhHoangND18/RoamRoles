package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type CategoryModel struct {
	ID        int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string `gorm:"column:name" json:"name"`
	Slug      string `gorm:"column:slug;unique" json:"slug"`
	IsActive  int    `gorm:"column:isActive" json:"isActive"`
	CreatedAt string `gorm:"column:createdAt" json:"createdAt"`
}

func (c CategoryModel) TableName() string {
	return "categories"
}

func GetCategories(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var categories []CategoryModel
		err := db.Find(&categories).Error
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