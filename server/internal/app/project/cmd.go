package project

// CreateProjectCmd 创建项目命令。
type CreateProjectCmd struct {
	Title       string
	Summary     *string
	Cover       *string
	Content     string
	Status      string
	ShortURL    *string
	IsPublished bool
}

// UpdateProjectCmd 更新项目命令。
type UpdateProjectCmd struct {
	ID          int64
	Title       string
	Summary     *string
	Cover       *string
	Content     string
	Status      string
	ShortURL    string
	IsPublished bool
}

// BatchSetPublishedCmd 批量设置发布状态命令。
type BatchSetPublishedCmd struct {
	IDs         []int64
	IsPublished bool
}

// BatchDeleteCmd 批量删除项目命令。
type BatchDeleteCmd struct {
	IDs []int64
}
