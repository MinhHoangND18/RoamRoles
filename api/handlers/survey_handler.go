package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// SurveySet - Bộ câu hỏi
type SurveySet struct {
	ID          int64            `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string           `gorm:"column:name;not null" json:"name"`
	Description string           `gorm:"column:description" json:"description"`
	Slug        string           `gorm:"column:slug;type:varchar(255);unique;not null" json:"slug"`
	Active      bool             `gorm:"column:active;default:true" json:"active"`
	CreatedAt   time.Time        `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time        `gorm:"column:updated_at" json:"updated_at"`
	Questions   []SurveyQuestion `gorm:"foreignKey:SetID" json:"questions,omitempty"`
}

func (SurveySet) TableName() string {
	return "survey_sets"
}

// SurveyQuestion
type SurveyQuestion struct {
	ID        int64          `gorm:"primaryKey;autoIncrement" json:"id"`
	SetID     int64          `gorm:"column:set_id;not null" json:"set_id"`
	Question  string         `gorm:"column:question;not null" json:"question"`
	Active    bool           `gorm:"column:active;default:true" json:"active"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	Options   []SurveyOption `gorm:"foreignKey:QuestionID" json:"options,omitempty"`
}

func (SurveyQuestion) TableName() string {
	return "survey_questions"
}

// SurveyOption - Lựa chọn cho câu hỏi
type SurveyOption struct {
	ID         int64  `gorm:"primaryKey;autoIncrement" json:"id"`
	QuestionID int64  `gorm:"column:question_id;not null" json:"question_id"`
	Text       string `gorm:"column:text;not null" json:"text"`
	Order      int    `gorm:"column:order;default:0" json:"order"`
}

func (SurveyOption) TableName() string {
	return "survey_options"
}

// SurveyResponse - Câu trả lời
type SurveyResponse struct {
	ID         int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	SetID      int64     `gorm:"column:set_id;not null" json:"set_id"`
	QuestionID int64     `gorm:"column:question_id;not null" json:"question_id"`
	OptionID   int64     `gorm:"column:option_id;not null" json:"option_id"`
	UserIP     string    `gorm:"column:user_ip" json:"user_ip"`
	SessionID  string    `gorm:"column:session_id;type:varchar(255);not null" json:"session_id"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
}

func (SurveyResponse) TableName() string {
	return "survey_responses"
}

// ============ REQUEST TYPES ============

type CreateSetRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Slug        string `json:"slug"`
	Active      bool   `json:"active"`
}

type CreateQuestionRequest struct {
	SetID    int64    `json:"set_id"`
	Question string   `json:"question"`
	Active   bool     `json:"active"`
	Options  []string `json:"options"`
}

type SubmitSurveyRequest struct {
	SetID     int64                  `json:"set_id"`
	SessionID string                 `json:"session_id"`
	Answers   map[string]interface{} `json:"answers"` // key: question_id, value: option_text
}

// GetAllSurveySets
func GetAllSurveySets(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var sets []SurveySet
		if err := db.Find(&sets).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sets)
	}
}

// GetActiveSurveySets
func GetActiveSurveySets(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var sets []SurveySet
		if err := db.Where("active = ?", true).Find(&sets).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sets)
	}
}

// CreateSurveySet
func CreateSurveySet(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req CreateSetRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		set := SurveySet{
			Name:        req.Name,
			Description: req.Description,
			Slug:        req.Slug,
			Active:      req.Active,
		}

		if err := db.Create(&set).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(set)
	}
}

// UpdateSurveySet
func UpdateSurveySet(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, _ := strconv.ParseInt(params["id"], 10, 64)

		var req CreateSetRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result := db.Model(&SurveySet{}).Where("id = ?", id).Updates(map[string]interface{}{
			"name":        req.Name,
			"description": req.Description,
			"slug":        req.Slug,
			"active":      req.Active,
		})

		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Survey set updated successfully"})
	}
}

// DeleteSurveySet
func DeleteSurveySet(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]

		if result := db.Delete(&SurveySet{}, id); result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Survey set deleted successfully"})
	}
}

// GetQuestionsBySetID
func GetQuestionsBySetID(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		setID, _ := strconv.ParseInt(params["set_id"], 10, 64)

		var questions []SurveyQuestion
		err := db.Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("`order` ASC")
		}).Where("set_id = ?", setID).Find(&questions).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(questions)
	}
}

// GetActiveQuestionsBySetID - Lấy câu hỏi active của bộ survey (CHỈ KHI survey set cũng active)
func GetActiveQuestionsBySetID(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		setID, _ := strconv.ParseInt(params["set_id"], 10, 64)

		var surveySet SurveySet
		if err := db.Where("id = ? AND active = ?", setID, true).First(&surveySet).Error; err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]SurveyQuestion{})
			return
		}

		var questions []SurveyQuestion
		err := db.Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("`order` ASC")
		}).Where("set_id = ? AND active = ?", setID, true).Find(&questions).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(questions)
	}
}

// CreateQuestion
func CreateQuestion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req CreateQuestionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		question := SurveyQuestion{
			SetID:    req.SetID,
			Question: req.Question,
			Active:   req.Active,
		}

		if err := db.Create(&question).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for i, optText := range req.Options {
			option := SurveyOption{
				QuestionID: question.ID,
				Text:       optText,
				Order:      i + 1,
			}
			if err := db.Create(&option).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		db.Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("`order` ASC")
		}).First(&question, question.ID)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(question)
	}
}

// UpdateQuestion
func UpdateQuestion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, _ := strconv.ParseInt(params["id"], 10, 64)

		var req CreateQuestionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Update question
		result := db.Model(&SurveyQuestion{}).Where("id = ?", id).Updates(map[string]interface{}{
			"question": req.Question,
			"active":   req.Active,
		})

		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		db.Where("question_id = ?", id).Delete(&SurveyOption{})

		for i, optText := range req.Options {
			option := SurveyOption{
				QuestionID: id,
				Text:       optText,
				Order:      i + 1,
			}
			if err := db.Create(&option).Error; err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Question updated successfully"})
	}
}

// DeleteQuestion
func DeleteQuestion(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id := params["id"]
		if result := db.Delete(&SurveyQuestion{}, id); result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Question deleted successfully"})
	}
}

// SubmitSurveyResponse
func SubmitSurveyResponse(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req SubmitSurveyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		userIP := r.Header.Get("X-Forwarded-For")
		if userIP == "" {
			userIP = r.RemoteAddr
		}

		var responses []SurveyResponse

		for questionIDStr, answer := range req.Answers {
			questionID, _ := strconv.ParseInt(questionIDStr, 10, 64)

			var option SurveyOption
			db.Where("question_id = ? AND text = ?", questionID, answer).First(&option)

			if option.ID != 0 {
				responses = append(responses, SurveyResponse{
					SetID:      req.SetID,
					QuestionID: questionID,
					OptionID:   option.ID,
					UserIP:     userIP,
					SessionID:  req.SessionID,
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

// GetSurveyStatistics
func GetSurveyStatistics(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		setID, _ := strconv.ParseInt(params["set_id"], 10, 64)

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
			SetID          int64          `json:"set_id"`
			SetName        string         `json:"set_name"`
			TotalResponses int64          `json:"total_responses"`
			QuestionStats  []QuestionStat `json:"question_stats"`
		}

		var stats Statistics
		stats.SetID = setID

		// Get set info
		var set SurveySet
		db.First(&set, setID)
		stats.SetName = set.Name

		// Total unique sessions for this set
		db.Model(&SurveyResponse{}).Where("set_id = ?", setID).Distinct("session_id").Count(&stats.TotalResponses)

		// Stats per question
		var questions []SurveyQuestion
		db.Preload("Options").Where("set_id = ?", setID).Find(&questions)

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
