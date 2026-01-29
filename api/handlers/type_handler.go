package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type TypeModel struct {
	ID       int64  `json:"id"`
	TypeName string `gorm:"column:type_name" json:"type_name"`
	Slug     string `gorm:"column:slug;type:varchar(255)" json:"slug"`
}

func (p TypeModel) TableName() string {
	return "types"
}

func GetTypeBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}
		typeModel := TypeModel{}
		result := db.Model(&TypeModel{}).Where("slug = ?", slug).First(&typeModel)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "type not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(typeModel)
	}
}

func GetTypes(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		typeModel := []TypeModel{}
		err := db.Model(&TypeModel{}).Find(&typeModel).Error
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(typeModel)
	}
}
