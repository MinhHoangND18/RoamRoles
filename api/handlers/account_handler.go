package handlers

import (
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type AccountModel struct {
	ID      int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	Account string `gorm:"column:account;unique" json:"account"`
	Status  string `gorm:"column:status" json:"status"`
}

func (AccountModel) TableName() string {
	return "accounts"
}

func GetAccounts(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var accounts []AccountModel
		db.Order("id DESC").Find(&accounts)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(accounts)
	}
}

func GetAccountByID(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var account AccountModel
		if err := db.First(&account, params["id"]).Error; err != nil {
			http.Error(w, "Account not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(account)
	}
}

func CreateAccount(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var account AccountModel
		if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		if err := db.Create(&account).Error; err != nil {
			http.Error(w, "Account already exists or DB error", http.StatusConflict)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Account added successfully"})
	}
}

func UpdateAccount(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		var account AccountModel
		if err := db.First(&account, params["id"]).Error; err != nil {
			http.Error(w, "Account not found", http.StatusNotFound)
			return
		}
		if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		db.Save(&account)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(account)
	}
}

func CheckAccess(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		email := r.URL.Query().Get("email")
		if email == "" {
			http.Error(w, "Email is required", http.StatusBadRequest)
			return
		}

		var account AccountModel
		result := db.Where("account = ?", email).First(&account)

		w.Header().Set("Content-Type", "application/json")

		if result.Error != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"message": "Email không có quyền truy cập.",
			})
			return
		}

		if account.Status != "active" {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"message": "Tài khoản của bạn đã bị khóa.",
			})
			return
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"allowed": true,
		})
	}
}