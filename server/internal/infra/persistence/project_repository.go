package persistence

import (
	"context"
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/grtsinry43/grtblog-v2/server/internal/domain/project"
	"github.com/grtsinry43/grtblog-v2/server/internal/infra/persistence/model"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) CreateProject(ctx context.Context, p *project.Project) error {
	m := mapProjectToModel(p)
	if err := r.db.WithContext(ctx).Create(m).Error; err != nil {
		if isProjectShortURLConstraint(err) {
			return project.ErrProjectShortURLExists
		}
		return err
	}
	p.ID = m.ID
	p.CreatedAt = m.CreatedAt
	p.UpdatedAt = m.UpdatedAt
	return nil
}

func (r *ProjectRepository) GetProjectByID(ctx context.Context, id int64) (*project.Project, error) {
	var m model.Project
	if err := r.db.WithContext(ctx).First(&m, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, project.ErrProjectNotFound
		}
		return nil, err
	}
	entity := mapProjectToDomain(m)
	return &entity, nil
}

func (r *ProjectRepository) GetProjectByShortURL(ctx context.Context, shortURL string) (*project.Project, error) {
	var m model.Project
	if err := r.db.WithContext(ctx).Where("short_url = ?", shortURL).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, project.ErrProjectNotFound
		}
		return nil, err
	}
	entity := mapProjectToDomain(m)
	return &entity, nil
}

func (r *ProjectRepository) UpdateProject(ctx context.Context, p *project.Project) error {
	updates := map[string]any{
		"title":        p.Title,
		"summary":      p.Summary,
		"cover":        p.Cover,
		"content":      p.Content,
		"status":       p.Status,
		"short_url":    p.ShortURL,
		"is_published": p.IsPublished,
	}
	if err := r.db.WithContext(ctx).
		Model(&model.Project{}).
		Where("id = ?", p.ID).
		Updates(updates).Error; err != nil {
		if isProjectShortURLConstraint(err) {
			return project.ErrProjectShortURLExists
		}
		return err
	}
	return nil
}

func (r *ProjectRepository) DeleteProject(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Project{}, id).Error
}

func (r *ProjectRepository) ListProjects(ctx context.Context, opts project.ProjectListOptionsInternal) ([]*project.Project, int64, error) {
	q := r.db.WithContext(ctx).Model(&model.Project{})
	if opts.Published != nil {
		q = q.Where("is_published = ?", *opts.Published)
	}
	if opts.Search != nil && *opts.Search != "" {
		q = q.Where("title ILIKE ?", "%"+*opts.Search+"%")
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var records []model.Project
	offset := (opts.Page - 1) * opts.PageSize
	if err := q.Order("created_at DESC").Offset(offset).Limit(opts.PageSize).Find(&records).Error; err != nil {
		return nil, 0, err
	}

	items := make([]*project.Project, len(records))
	for i, rec := range records {
		p := mapProjectToDomain(rec)
		items[i] = &p
	}
	return items, total, nil
}

func (r *ProjectRepository) ListPublicProjects(ctx context.Context, opts project.ProjectListOptions) ([]*project.Project, int64, error) {
	q := r.db.WithContext(ctx).Model(&model.Project{}).Where("is_published = ?", true)
	if opts.Search != nil && *opts.Search != "" {
		q = q.Where("title ILIKE ?", "%"+*opts.Search+"%")
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var records []model.Project
	offset := (opts.Page - 1) * opts.PageSize
	if err := q.Order("created_at DESC").Offset(offset).Limit(opts.PageSize).Find(&records).Error; err != nil {
		return nil, 0, err
	}

	items := make([]*project.Project, len(records))
	for i, rec := range records {
		p := mapProjectToDomain(rec)
		items[i] = &p
	}
	return items, total, nil
}

func (r *ProjectRepository) ListPublishedProjectShortURLs(ctx context.Context) ([]string, error) {
	var urls []string
	if err := r.db.WithContext(ctx).
		Model(&model.Project{}).
		Where("is_published = ?", true).
		Pluck("short_url", &urls).Error; err != nil {
		return nil, err
	}
	return urls, nil
}

func mapProjectToModel(p *project.Project) *model.Project {
	return &model.Project{
		ID:          p.ID,
		Title:       p.Title,
		Summary:     p.Summary,
		Cover:       p.Cover,
		Content:     p.Content,
		Status:      p.Status,
		ShortURL:    p.ShortURL,
		AuthorID:    p.AuthorID,
		IsPublished: p.IsPublished,
	}
}

func mapProjectToDomain(m model.Project) project.Project {
	p := project.Project{
		ID:          m.ID,
		Title:       m.Title,
		Summary:     m.Summary,
		Cover:       m.Cover,
		Content:     m.Content,
		Status:      m.Status,
		ShortURL:    m.ShortURL,
		AuthorID:    m.AuthorID,
		IsPublished: m.IsPublished,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
	if m.DeletedAt.Valid {
		p.DeletedAt = &m.DeletedAt.Time
	}
	return p
}

func isProjectShortURLConstraint(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "idx_project_short_url")
}
