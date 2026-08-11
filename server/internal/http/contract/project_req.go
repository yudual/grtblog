package contract

// CreateProjectReq 创建项目请求。
type CreateProjectReq struct {
	Title       string  `json:"title" validate:"required,max=255"`
	Summary     *string `json:"summary,omitempty"`
	Cover       *string `json:"cover,omitempty"`
	Content     string  `json:"content"`
	Status      string  `json:"status,omitempty"`
	ShortURL    *string `json:"shortUrl,omitempty"`
	IsPublished bool    `json:"isPublished"`
}

// UpdateProjectReq 更新项目请求。
type UpdateProjectReq struct {
	Title       string  `json:"title" validate:"required,max=255"`
	Summary     *string `json:"summary,omitempty"`
	Cover       *string `json:"cover,omitempty"`
	Content     string  `json:"content"`
	Status      string  `json:"status,omitempty"`
	ShortURL    string  `json:"shortUrl" validate:"required"`
	IsPublished bool    `json:"isPublished"`
}

// BatchSetProjectPublishedReq 批量切换发布状态请求。
type BatchSetProjectPublishedReq struct {
	IDs         []int64 `json:"ids"`
	IsPublished bool    `json:"isPublished"`
}

// BatchDeleteProjectReq 批量删除项目请求。
type BatchDeleteProjectReq struct {
	IDs []int64 `json:"ids"`
}
