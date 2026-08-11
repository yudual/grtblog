package contract

import "time"

// ProjectResp 项目详情响应。
type ProjectResp struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Summary     *string   `json:"summary,omitempty"`
	Cover       *string   `json:"cover,omitempty"`
	Content     string    `json:"content"`
	Status      string    `json:"status"`
	ShortURL    string    `json:"shortUrl"`
	AuthorID    int64     `json:"authorId"`
	IsPublished bool      `json:"isPublished"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ProjectListItemResp 项目列表项响应。
type ProjectListItemResp struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Summary     *string   `json:"summary,omitempty"`
	Cover       *string   `json:"cover,omitempty"`
	Status      string    `json:"status"`
	ShortURL    string    `json:"shortUrl"`
	IsPublished bool      `json:"isPublished"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ProjectListResp 项目列表响应。
type ProjectListResp struct {
	Items []ProjectListItemResp `json:"items"`
	Total int64                 `json:"total"`
	Page  int                   `json:"page"`
	Size  int                   `json:"size"`
}
