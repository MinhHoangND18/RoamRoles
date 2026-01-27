package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// Models
type SurveyQuestion struct {
	ID        int64          `gorm:"primaryKey;autoIncrement" json:"id"`
	Question  string         `gorm:"column:question;not null" json:"question"`
	Active    bool           `gorm:"column:active;default:true" json:"active"`
	Order     int            `gorm:"column:order;default:0" json:"order"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	Options   []SurveyOption `gorm:"foreignKey:QuestionID" json:"options"`
}

func (SurveyQuestion) TableName() string {
	return "survey_questions"
}

type SurveyOption struct {
	ID         int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	QuestionID int64  `gorm:"column:question_id;not null" json:"question_id"`
	Text       string `gorm:"column:text;not null" json:"text"`
	Order      int    `gorm:"column:order;default:0" json:"order"`
}

func (SurveyOption) TableName() string {
	return "survey_options"
}

type SurveyResponse struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	QuestionID int64     `gorm:"column:question_id;not null" json:"question_id"`
	OptionID   int64     `gorm:"column:option_id;not null" json:"option_id"`
	UserIP     string    `gorm:"column:user_ip" json:"user_ip"`
	SessionID  string    `gorm:"type:varchar(191);primaryKey" json:"session_id"`
	CreatedAt  time.Time `gorm:"type:datetime;column:created_at" json:"created_at"`
}

func (SurveyResponse) TableName() string {
	return "survey_responses"
}

type SubmitSurveyRequest struct {
	SessionID string                 `json:"session_id"`
	Answers   map[string]interface{} `json:"answers"`
}

// Get active questions for client
func GetSurveyQuestions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var questions []SurveyQuestion
		err := db.Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("survey_options.order ASC")
		}).Where("active = ?", true).Order("\"order\" ASC").Find(&questions).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(questions)
	}
}

// Get all questions for admin
func GetAllSurveyQuestions(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var questions []SurveyQuestion
		err := db.Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("survey_options.order ASC")
		}).Order("\"order\" ASC").Find(&questions).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(questions)
	}
}

// Create or Update question
func HandleSurveyQuestion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		idParam := params["id"]

		var question SurveyQuestion
		if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if idParam != "" && idParam != "0" {
			id, _ := strconv.ParseInt(idParam, 10, 64)
			question.ID = id
			db.Where("question_id = ?", id).Delete(&SurveyOption{})

			result := db.Model(&SurveyQuestion{}).Where("id = ?", id).Updates(map[string]interface{}{
				"question": question.Question,
				"active":   question.Active,
				"order":    question.Order,
			})

			if result.Error != nil {
				http.Error(w, result.Error.Error(), http.StatusInternalServerError)
				return
			}

			for i := range question.Options {
				question.Options[i].QuestionID = id
				if err := db.Create(&question.Options[i]).Error; err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Question updated successfully"})
		} else {
			// Create new question
			// Get max order
			var maxOrder int
			db.Model(&SurveyQuestion{}).Select("COALESCE(MAX(\"order\"), 0)").Scan(&maxOrder)
			question.Order = maxOrder + 1

			if err := db.Create(&question).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(question)
		}
	}
}

// Delete question
func DeleteSurveyQuestion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		db.Where("question_id = ?", id).Delete(&SurveyOption{})

		if result := db.Delete(&SurveyQuestion{}, id); result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Question deleted successfully"})
	}
}

// Submit survey response
func SubmitSurveyResponse(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var submitReq SubmitSurveyRequest
		if err := json.NewDecoder(r.Body).Decode(&submitReq); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		userIP := r.Header.Get("X-Forwarded-For")
		if userIP == "" {
			userIP = r.RemoteAddr
		}

		var responses []SurveyResponse

		for questionIDStr, answer := range submitReq.Answers {
			questionID, _ := strconv.ParseInt(questionIDStr, 10, 64)

			var option SurveyOption
			db.Where("question_id = ? AND text = ?", questionID, answer).First(&option)

			if option.ID != 0 {
				responses = append(responses, SurveyResponse{
					QuestionID: questionID,
					OptionID:   option.ID,
					UserIP:     userIP,
					SessionID:  submitReq.SessionID,
					CreatedAt:  time.Now(),
				})
			}
		}

		if len(responses) > 0 {

			if err := db.Create(&responses).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Response submitted successfully"})
	}
}

// Get survey statistics
func GetSurveyStatistics(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type OptionStat struct {
			Text  string `json:"text"`
			Count int64  `json:"count"`
		}

		type QuestionStat struct {
			QuestionID int64        `json:"question_id"`
			Question   string       `json:"question"`
			Options    []OptionStat `json:"options"`
		}

		type Statistics struct {
			TotalResponses int64          `json:"total_responses"`
			QuestionStats  []QuestionStat `json:"question_stats"`
		}

		var stats Statistics

		// Total unique sessions
		db.Model(&SurveyResponse{}).Distinct("session_id").Count(&stats.TotalResponses)

		// Stats per question
		var questions []SurveyQuestion
		db.Preload("Options").Find(&questions)

		for _, q := range questions {
			questionStat := QuestionStat{
				QuestionID: q.ID,
				Question:   q.Question,
				Options:    []OptionStat{},
			}

			for _, opt := range q.Options {
				var count int64
				db.Model(&SurveyResponse{}).Where("option_id = ?", opt.ID).Count(&count)

				questionStat.Options = append(questionStat.Options, OptionStat{
					Text:  opt.Text,
					Count: count,
				})
			}

			stats.QuestionStats = append(stats.QuestionStats, questionStat)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(stats)
	}
}
