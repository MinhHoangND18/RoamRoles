package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PostModel struct {
	ID             int64          `json:"id"`
	Slug           string         `gorm:"column:slug" json:"slug"`
	Content        string         `gorm:"column:content" json:"content"`
	Title          string         `gorm:"column:title" json:"title"`
	Excerpt        string         `gorm:"column:excerpt" json:"excerpt"`
	TitleHeader    string         `gorm:"column:title_header" json:"title_header"`
	Status         string         `gorm:"column:status" json:"status"`
	PostNavigation string         `gorm:"-" json:"post_navigation"`
	ThumbnailURL   string         `gorm:"column:thumbnailUrl" json:"thumbnail_url"`
	TypeID         int64          `gorm:"column:type_id" json:"type_id"`
	Type           TypeModel      `json:"type"`
	CategoryID     *int64         `gorm:"column:category_id" json:"category_id"`
	Category       *CategoryModel `json:"category"`
}

func (p PostModel) TableName() string {
	return "posts"
}

type PostResponse struct {
	ID             int64          `json:"id"`
	Slug           string         `json:"slug"`
	Content        string         `json:"content"`
	Title          string         `gorm:"column:title" json:"title"`
	Excerpt        string         `gorm:"column:excerpt" json:"excerpt"`
	TitleHeader    string         `gorm:"column:title_header" json:"title_header"`
	Status         string         `gorm:"column:status" json:"status"`
	PostNavigation string         `json:"post_navigation"`
	ThumbnailURL   string         `gorm:"column:thumbnailUrl" json:"thumbnail_url"`
	TypeID         int64          `gorm:"column:type_id" json:"type_id"`
	Type           TypeModel      `gorm:"foreignKey:TypeID" json:"type"`
	CategoryID     *int64         `gorm:"column:category_id" json:"category_id"`
	Category       *CategoryModel `gorm:"foreignKey:CategoryID" json:"category"`
}

func GetPostById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := strconv.ParseInt(params["id"], 10, 64)
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		typeParam := r.URL.Query().Get("type")

		post := PostModel{}
		query := db.Model(&PostModel{}).Preload("Type").Where("id = ?", id)

		if typeParam != "" {
			typeID, err := strconv.Atoi(typeParam)
			if err != nil {
				http.Error(w, "Invalid type parameter", http.StatusBadRequest)
				return
			}
			query = query.Where("type_id = ?", typeID)
		}

		result := query.First(&post)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Post not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
}

func GetPosts(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		post := []PostModel{}
		err := db.Model(&PostModel{}).Preload("Type").Preload("Category").Find(&post).Error
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
}

func UpdatePostById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := strconv.ParseInt(params["id"], 10, 64)
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		typeParam := r.URL.Query().Get("type")

		var payload map[string]interface{}
		err = json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		query := db.Model(&PostModel{}).Where("id = ?", id)

		if typeParam != "" {
			typeID, err := strconv.Atoi(typeParam)
			if err != nil {
				http.Error(w, "Invalid type parameter", http.StatusBadRequest)
				return
			}
			query = query.Where("type_id = ?", typeID)
		}

		result := query.Updates(payload)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		if result.RowsAffected == 0 {
			var count int64
			db.Model(&PostModel{}).Where("id = ?", id).Count(&count)
			if count == 0 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "Post not found."})
				return
			}
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Post updated successfully"})
	}
}

func CreatePost(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var post PostModel
		err := json.NewDecoder(r.Body).Decode(&post)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		originalSlug := post.Slug
		suffix := 0
		for {
			var count int64
			db.Model(&PostModel{}).Where("slug = ?", post.Slug).Count(&count)

			if count == 0 {
				break
			}
			suffix++
			post.Slug = originalSlug + "-" + strconv.Itoa(suffix)
		}

		result := db.Create(&post)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)
	}
}

func CheckSlugUniqueness(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := r.URL.Query().Get("slug")
		if slug == "" {
			http.Error(w, "Slug parameter is required", http.StatusBadRequest)
			return
		}

		var count int64
		db.Model(&PostModel{}).Where("slug = ?", slug).Count(&count)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"exists": count > 0})
	}
}

func GetPostBySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		typeParam := r.URL.Query().Get("type")

		post := PostModel{}
		query := db.Model(&PostModel{}).Preload("Type").Where("slug = ?", slug)

		if typeParam != "" {
			typeID, err := strconv.Atoi(typeParam)
			if err != nil {
				http.Error(w, "Invalid type parameter", http.StatusBadRequest)
				return
			}
			query = query.Where("type_id = ?", typeID)
		}

		result := query.First(&post)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Post not found", http.StatusNotFound)
				return
			}
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}
	
}

func GetPostsByCategorySlug(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		categorySlug := params["slug"]

		pageStr := r.URL.Query().Get("page")
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		limit := 10
		offset := (page - 1) * limit

		var category CategoryModel
		if err := db.Where("slug = ?", categorySlug).First(&category).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Category not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var totalPosts int64
		db.Model(&PostModel{}).Where("category_id = ? AND status = ?", category.ID, "active").Count(&totalPosts)

		var posts []PostModel
		err = db.Model(&PostModel{}).
			Preload("Type").
			Preload("Category").
			Where("category_id = ? AND status = ?", category.ID, "active").
			Order("created_at DESC").
			Limit(limit).
			Offset(offset).
			Find(&posts).Error

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		totalPages := int((totalPosts + int64(limit) - 1) / int64(limit))
		hasNext := page < totalPages
		hasPrev := page > 1

		response := map[string]interface{}{
			"category": category,
			"posts":    posts,
			"pagination": map[string]interface{}{
				"current_page": page,
				"total_pages":  totalPages,
				"total_posts":  totalPosts,
				"per_page":     limit,
				"has_next":     hasNext,
				"has_prev":     hasPrev,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}