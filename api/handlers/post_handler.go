package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type PostModel struct {
	ID              int64          `json:"id"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Content         string         `gorm:"column:content" json:"content,omitempty"`
	Title           string         `gorm:"column:title" json:"title"`
	Excerpt         string         `gorm:"column:excerpt" json:"excerpt"`
	Status          string         `gorm:"column:status" json:"status"`
	PostNavigation  string         `gorm:"column:post_navigation" json:"post_navigation"`
	ThumbnailURL    string         `gorm:"column:thumbnail_url" json:"thumbnail_url"`
	TypeID          int64          `gorm:"column:type_id" json:"type_id,omitempty"`
	Type            TypeModel      `json:"type,omitempty"`
	CategoryID      *int64         `gorm:"column:category_id" json:"category_id"`
	Category        *CategoryModel `json:"category"`
	RecommendPostID *int64         `gorm:"column:recommend_post_id" json:"recommend_post_id,omitempty"`
	RecommendPost   *PostModel     `gorm:"foreignKey:RecommendPostID" json:"recommend_post,omitempty"`
	SurveySetID     *int64         `gorm:"column:survey_set_id" json:"survey_set_id,omitempty"`
	SurveySet       *SurveySet     `gorm:"foreignKey:SurveySetID" json:"survey_set,omitempty"`
}

func (p PostModel) TableName() string {
	return "posts"
}

type PostResponse struct {
	ID              int64          `json:"id"`
	Slug            string         `json:"slug"`
	Content         string         `json:"content"`
	Title           string         `gorm:"column:title" json:"title"`
	Excerpt         string         `gorm:"column:excerpt" json:"excerpt"`
	Status          string         `gorm:"column:status" json:"status"`
	PostNavigation  string         `json:"post_navigation"`
	ThumbnailURL    string         `gorm:"column:thumbnail_url" json:"thumbnail_url"`
	TypeID          int64          `gorm:"column:type_id" json:"type_id"`
	Type            TypeModel      `gorm:"foreignKey:TypeID" json:"type"`
	CategoryID      *int64         `gorm:"column:category_id" json:"category_id"`
	Category        *CategoryModel `gorm:"foreignKey:CategoryID" json:"category"`
	RecommendPostID *int64         `gorm:"column:recommend_post_id" json:"recommend_post_id,omitempty"`
	RecommendPost   *PostModel     `gorm:"foreignKey:RecommendPostID" json:"recommend_post,omitempty"`
	SurveySetID     *int64         `gorm:"column:survey_set_id" json:"survey_set_id,omitempty"`
	SurveySet       *SurveySet     `gorm:"foreignKey:SurveySetID" json:"survey_set,omitempty"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	TotalPages  int   `json:"total_pages"`
	TotalPosts  int64 `json:"total_posts"`
	PerPage     int   `json:"per_page"`
	HasNext     bool  `json:"has_next"`
	HasPrev     bool  `json:"has_prev"`
}

type CategoryPostsResponse struct {
	Category   CategoryModel  `json:"category"`
	Posts      []PostModel    `json:"posts"`
	Pagination PaginationMeta `json:"pagination"`
}

// Helper: Gọi sang Upload Service để tải ảnh về
func processThumbnailWithService(thumbnailURL string) string {
	// 1. Nếu URL rỗng hoặc đã là link nội bộ (chứa domain của mình hoặc đường dẫn tương đối) thì bỏ qua
	// Bạn có thể thay "jobzestry.com" bằng domain thực tế hoặc check biến môi trường
	if thumbnailURL == "" || strings.Contains(thumbnailURL, "/uploads/") {
		return thumbnailURL
	}

	// 2. Cấu hình request gửi sang Upload Service
	// Giả sử Upload Service chạy ở localhost:8089 trên cùng server
	uploadServiceURL := "http://127.0.0.1:8089/api/upload/from-url"
	
	requestBody, _ := json.Marshal(map[string]string{
		"url": thumbnailURL,  
	})

	resp, err := http.Post(uploadServiceURL, "application/json", bytes.NewBuffer(requestBody))
	if err != nil {
		fmt.Printf("Error calling upload service: %v\n", err)
		return thumbnailURL // Lỗi thì giữ nguyên link cũ
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("Upload service returned status: %d\n", resp.StatusCode)
		return thumbnailURL
	}

	// 3. Parse kết quả trả về (Giả sử service trả về {"url": "..."} hoặc {"file_path": "..."})
	var result map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return thumbnailURL
	}

	// Ưu tiên lấy key "url" hoặc "file_path" tùy theo code của service upload
	if newURL, ok := result["url"]; ok && newURL != "" {
		return newURL
	}
	return thumbnailURL
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
		query := db.Model(&PostModel{}).Preload("Type").
			Preload("RecommendPost", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "slug", "title", "thumbnail_url", "excerpt", "status")
			}).
			Preload("SurveySet").
			Where("id = ?", id)

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
		err := db.Model(&PostModel{}).Preload("Type").
			Preload("Category").
			Preload("RecommendPost", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "slug", "title", "thumbnail_url", "excerpt", "status")
			}).
			Preload("SurveySet").
			Find(&post).Error
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

		// Xử lý ảnh nếu có thay đổi thumbnail
		if url, ok := payload["thumbnail_url"].(string); ok {
			payload["thumbnail_url"] = processThumbnailWithService(url)
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

		post.ThumbnailURL = processThumbnailWithService(post.ThumbnailURL)

		originalSlug := post.Slug
		suffix := 0
		for {
			var count int64
			db.Model(&PostModel{}).Where("slug = ?", post.Slug).Count(&count)
			var countPage int64
			db.Model(&PageModel{}).Where("slug = ?", post.Slug).Count(&countPage)
			var countCategory int64
			db.Model(&CategoryModel{}).Where("slug = ?", post.Slug).Count(&countCategory)

			if count == 0 && countPage == 0 && countCategory == 0 {
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
		query := db.Model(&PostModel{}).Preload("Type").Preload("RecommendPost").Where("slug = ?", slug).Where("status = ?", "active")

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
		slug := params["slug"]
		if slug == "" {
			http.Error(w, "Category slug is required", http.StatusBadRequest)
			return
		}

		pageParam := r.URL.Query().Get("page")
		page := 1
		if pageParam != "" {
			parsedPage, err := strconv.Atoi(pageParam)
			if err == nil && parsedPage > 0 {
				page = parsedPage
			}
		}

		perPageParam := r.URL.Query().Get("per_page")
		perPage := 10
		if perPageParam != "" {
			parsedPerPage, err := strconv.Atoi(perPageParam)
			if err == nil && parsedPerPage > 0 && parsedPerPage <= 100 {
				perPage = parsedPerPage
			}
		}

		var category CategoryModel
		if err := db.Where("slug = ?", slug).First(&category).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Category not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var totalPosts int64
		statusParam := r.URL.Query().Get("status")

		countQuery := db.Model(&PostModel{}).Where("category_id = ?", category.ID)
		if statusParam != "" {
			countQuery = countQuery.Where("status = ?", statusParam)
		}

		if err := countQuery.Count(&totalPosts).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		totalPages := int(math.Ceil(float64(totalPosts) / float64(perPage)))
		if page > totalPages && totalPages > 0 {
			page = totalPages
		}

		offset := (page - 1) * perPage

		var posts []PostModel
		findQuery := db.Model(&PostModel{}).
			Preload("Type").
			Preload("Category").
			Where("category_id = ?", category.ID)

		if statusParam != "" {
			findQuery = findQuery.Where("status = ?", statusParam)
		}

		if err := findQuery.
			Order("id DESC").
			Limit(perPage).
			Offset(offset).
			Find(&posts).Error; err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		response := CategoryPostsResponse{
			Category: category,
			Posts:    posts,
			Pagination: PaginationMeta{
				CurrentPage: page,
				TotalPages:  totalPages,
				TotalPosts:  totalPosts,
				PerPage:     perPage,
				HasNext:     page < totalPages,
				HasPrev:     page > 1,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func GetRecommendPost(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		id, err := strconv.ParseInt(params["id"], 10, 64)
		if err != nil {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		var result struct {
			RecommendPostID *int64     `json:"recommend_post_id"`
			RecommendPost   *PostModel `json:"recommend_post"`
		}

		err = db.Model(&PostModel{}).
			Select("recommend_post_id").
			Preload("RecommendPost", func(db *gorm.DB) *gorm.DB {
				return db.Select("id", "slug", "title", "thumbnail_url", "excerpt", "status")
			}).
			Where("id = ?", id).
			First(&result).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Post not found", http.StatusNotFound)
			} else {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}