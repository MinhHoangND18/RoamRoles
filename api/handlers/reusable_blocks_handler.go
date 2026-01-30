package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type ReusableBlockModel struct {
	ID          int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string `gorm:"column:title;not null" json:"title"`
	ContentJSON string `gorm:"column:content_json;type:json" json:"content_json"`
	Status      string `gorm:"column:status;type:enum('active','inactive');default:'active'" json:"status"`
}

func (ReusableBlockModel) TableName() string {
	return "reusable_blocks"
}

func GetReusableBlocks(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var blocks []ReusableBlockModel
		
		status := r.URL.Query().Get("status")
		query := db.Order("id DESC")
		if status != "" {
			query = query.Where("status = ?", status)
		}

		if err := query.Find(&blocks).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(blocks)
	}
}

func GetReusableBlockById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		var block ReusableBlockModel
		if err := db.First(&block, id).Error; err != nil {
			http.Error(w, "Block not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(block)
	}
}

func HandleReusableBlock(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		idParam := params["id"]

		var block ReusableBlockModel
		if err := json.NewDecoder(r.Body).Decode(&block); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if idParam != "" && idParam != "0" {
			id, _ := strconv.ParseInt(idParam, 10, 64)
			result := db.Model(&ReusableBlockModel{}).Where("id = ?", id).Updates(block)
			if result.Error != nil {
				http.Error(w, result.Error.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"message": "Block updated successfully", "id": id})
		} else {
			if err := db.Create(&block).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(block)
		}
	}
}

func DeleteReusableBlock(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		if err := db.Delete(&ReusableBlockModel{}, id).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}