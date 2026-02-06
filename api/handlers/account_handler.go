package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

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

		// #region agent log
		if f, err := os.OpenFile("c:\\roamroles\\RoamRoles\\.cursor\\debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
			defer f.Close()
			entry := fmt.Sprintf(`{"sessionId":"debug-session","runId":"initial","hypothesisId":"G1","location":"api/handlers/account_handler.go:CheckAccess:entry","message":"CheckAccess called","data":{"email":"%s"}, "timestamp":%d}`+"\n", email, time.Now().UnixMilli())
			_, _ = f.WriteString(entry)
		}
		// #endregion

		var account AccountModel
		result := db.Where("account = ?", email).First(&account)

		w.Header().Set("Content-Type", "application/json")

		if result.Error != nil {
			if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}

			// #region agent log
			if f, err := os.OpenFile("c:\\roamroles\\RoamRoles\\.cursor\\debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
				defer f.Close()
				entry := fmt.Sprintf(`{"sessionId":"debug-session","runId":"initial","hypothesisId":"G2","location":"api/handlers/account_handler.go:CheckAccess:notFound","message":"Account not found, creating pending","data":{"email":"%s"}, "timestamp":%d}`+"\n", email, time.Now().UnixMilli())
				_, _ = f.WriteString(entry)
			}
			// #endregion

			newAccount := AccountModel{
				Account: email,
				Status:  "pending",
			}
			if err := db.Create(&newAccount).Error; err != nil {
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}

			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"status":  "pending",
				"message": "Tài khoản mới đã được ghi nhận và đang chờ phê duyệt.",
			})
			return
		}

		if account.Status != "active" {
			// #region agent log
			if f, err := os.OpenFile("c:\\roamroles\\RoamRoles\\.cursor\\debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
				defer f.Close()
				entry := fmt.Sprintf(`{"sessionId":"debug-session","runId":"initial","hypothesisId":"G3","location":"api/handlers/account_handler.go:CheckAccess:notActive","message":"Account not active","data":{"email":"%s","status":"%s"}, "timestamp":%d}`+"\n", email, account.Status, time.Now().UnixMilli())
				_, _ = f.WriteString(entry)
			}
			// #endregion

			json.NewEncoder(w).Encode(map[string]interface{}{
				"allowed": false,
				"status":  account.Status,
				"message": "The account is either not activated or has been locked.",
			})
			return
		}

		// #region agent log
		if f, err := os.OpenFile("c:\\roamroles\\RoamRoles\\.cursor\\debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err == nil {
			defer f.Close()
			entry := fmt.Sprintf(`{"sessionId":"debug-session","runId":"initial","hypothesisId":"G4","location":"api/handlers/account_handler.go:CheckAccess:allowed","message":"Account allowed","data":{"email":"%s","status":"%s"}, "timestamp":%d}`+"\n", email, account.Status, time.Now().UnixMilli())
			_, _ = f.WriteString(entry)
		}
		// #endregion

		json.NewEncoder(w).Encode(map[string]interface{}{
			"allowed": true,
			"status":  "active",
		})
	}
}