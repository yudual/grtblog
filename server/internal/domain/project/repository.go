package project

import "context"

// Repository 定义项目相关的持久化操作。
type Repository interface {
	CreateProject(ctx context.Context, project *Project) error
	GetProjectByID(ctx context.Context, id int64) (*Project, error)
	GetProjectByShortURL(ctx context.Context, shortURL string) (*Project, error)
	UpdateProject(ctx context.Context, project *Project) error
	DeleteProject(ctx context.Context, id int64) error
	ListProjects(ctx context.Context, opts ProjectListOptionsInternal) ([]*Project, int64, error)
	ListPublicProjects(ctx context.Context, opts ProjectListOptions) ([]*Project, int64, error)
	// ListPublishedProjectShortURLs 用于 ISR 路由发现。
	ListPublishedProjectShortURLs(ctx context.Context) ([]string, error)
}
