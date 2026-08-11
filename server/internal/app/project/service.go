package project

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/grtsinry43/grtblog-v2/server/internal/app/contentutil"
	appEvent "github.com/grtsinry43/grtblog-v2/server/internal/app/event"
	domainproject "github.com/grtsinry43/grtblog-v2/server/internal/domain/project"
)

type Service struct {
	repo   domainproject.Repository
	events appEvent.Bus
}

func NewService(repo domainproject.Repository, events appEvent.Bus) *Service {
	if events == nil {
		events = appEvent.NopBus{}
	}
	return &Service{repo: repo, events: events}
}

// CreateProject 创建项目。
func (s *Service) CreateProject(ctx context.Context, authorID int64, cmd CreateProjectCmd) (*domainproject.Project, error) {
	title := strings.TrimSpace(cmd.Title)
	if title == "" {
		return nil, domainproject.ErrProjectTitleRequired
	}

	shortURL := ""
	if cmd.ShortURL != nil {
		shortURL = strings.TrimSpace(*cmd.ShortURL)
	}
	if shortURL == "" {
		shortURL = contentutil.GenerateShortURLFromTitle(title)
	}
	if shortURL == "" {
		shortURL = contentutil.GenerateRandomShortURL()
	}
	shortURL, err := s.ensureShortURLAvailable(ctx, shortURL)
	if err != nil {
		return nil, err
	}

	p := &domainproject.Project{
		Title:       title,
		Summary:     cmd.Summary,
		Cover:       cmd.Cover,
		Content:     cmd.Content,
		Status:      normalizeStatus(cmd.Status),
		ShortURL:    shortURL,
		AuthorID:    authorID,
		IsPublished: cmd.IsPublished,
	}
	if err := s.repo.CreateProject(ctx, p); err != nil {
		return nil, err
	}

	now := time.Now()
	_ = s.events.Publish(ctx, ProjectCreated{
		ID:        p.ID,
		AuthorID:  p.AuthorID,
		Title:     p.Title,
		ShortURL:  p.ShortURL,
		Published: p.IsPublished,
		At:        now,
	})
	if p.IsPublished {
		_ = s.events.Publish(ctx, ProjectPublished{
			ID: p.ID, AuthorID: p.AuthorID, Title: p.Title, ShortURL: p.ShortURL, At: now,
		})
	}

	return p, nil
}

// UpdateProject 更新项目。
func (s *Service) UpdateProject(ctx context.Context, cmd UpdateProjectCmd) (*domainproject.Project, error) {
	existing, err := s.repo.GetProjectByID(ctx, cmd.ID)
	if err != nil {
		return nil, err
	}
	prevPublished := existing.IsPublished

	title := strings.TrimSpace(cmd.Title)
	if title == "" {
		return nil, domainproject.ErrProjectTitleRequired
	}
	existing.Title = title
	existing.Summary = cmd.Summary
	existing.Cover = cmd.Cover
	existing.Content = cmd.Content
	existing.Status = normalizeStatus(cmd.Status)

	shortURL := strings.TrimSpace(cmd.ShortURL)
	if shortURL == "" {
		shortURL = existing.ShortURL
	}
	if shortURL != existing.ShortURL {
		shortURL, err = s.ensureShortURLAvailable(ctx, shortURL)
		if err != nil {
			return nil, err
		}
	}
	existing.ShortURL = shortURL
	existing.IsPublished = cmd.IsPublished

	if err := s.repo.UpdateProject(ctx, existing); err != nil {
		return nil, err
	}

	now := time.Now()
	_ = s.events.Publish(ctx, ProjectUpdated{
		ID:        existing.ID,
		AuthorID:  existing.AuthorID,
		Title:     existing.Title,
		ShortURL:  existing.ShortURL,
		Published: existing.IsPublished,
		At:        now,
	})
	if !prevPublished && existing.IsPublished {
		_ = s.events.Publish(ctx, ProjectPublished{
			ID: existing.ID, AuthorID: existing.AuthorID, Title: existing.Title, ShortURL: existing.ShortURL, At: now,
		})
	}
	if prevPublished && !existing.IsPublished {
		_ = s.events.Publish(ctx, ProjectUnpublished{
			ID: existing.ID, AuthorID: existing.AuthorID, Title: existing.Title, ShortURL: existing.ShortURL, At: now,
		})
	}

	return existing, nil
}

// GetProjectByID 根据 ID 获取项目。
func (s *Service) GetProjectByID(ctx context.Context, id int64) (*domainproject.Project, error) {
	return s.repo.GetProjectByID(ctx, id)
}

// GetProjectByShortURL 根据短链接获取项目。
func (s *Service) GetProjectByShortURL(ctx context.Context, shortURL string) (*domainproject.Project, error) {
	return s.repo.GetProjectByShortURL(ctx, shortURL)
}

// ListProjects 获取项目列表（管理后台）。
func (s *Service) ListProjects(ctx context.Context, opts domainproject.ProjectListOptionsInternal) ([]*domainproject.Project, int64, error) {
	return s.repo.ListProjects(ctx, opts)
}

// ListPublicProjects 获取已发布的项目列表。
func (s *Service) ListPublicProjects(ctx context.Context, opts domainproject.ProjectListOptions) ([]*domainproject.Project, int64, error) {
	return s.repo.ListPublicProjects(ctx, opts)
}

// BatchSetPublished 批量设置发布状态。
func (s *Service) BatchSetPublished(ctx context.Context, cmd BatchSetPublishedCmd) error {
	ids := normalizeIDs(cmd.IDs)
	for _, id := range ids {
		p, err := s.repo.GetProjectByID(ctx, id)
		if err != nil {
			return err
		}
		if p.IsPublished == cmd.IsPublished {
			continue
		}
		p.IsPublished = cmd.IsPublished
		if err := s.repo.UpdateProject(ctx, p); err != nil {
			return err
		}

		now := time.Now()
		_ = s.events.Publish(ctx, ProjectUpdated{
			ID: p.ID, AuthorID: p.AuthorID, Title: p.Title, ShortURL: p.ShortURL,
			Published: p.IsPublished, At: now,
		})
		if cmd.IsPublished {
			_ = s.events.Publish(ctx, ProjectPublished{
				ID: p.ID, AuthorID: p.AuthorID, Title: p.Title, ShortURL: p.ShortURL, At: now,
			})
		} else {
			_ = s.events.Publish(ctx, ProjectUnpublished{
				ID: p.ID, AuthorID: p.AuthorID, Title: p.Title, ShortURL: p.ShortURL, At: now,
			})
		}
	}
	return nil
}

// DeleteProject 删除项目。
func (s *Service) DeleteProject(ctx context.Context, id int64) error {
	p, err := s.repo.GetProjectByID(ctx, id)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteProject(ctx, id); err != nil {
		return err
	}
	_ = s.events.Publish(ctx, ProjectDeleted{
		ID: p.ID, AuthorID: p.AuthorID, Title: p.Title, ShortURL: p.ShortURL, At: time.Now(),
	})
	return nil
}

// BatchDelete 批量删除项目。
func (s *Service) BatchDelete(ctx context.Context, cmd BatchDeleteCmd) error {
	ids := normalizeIDs(cmd.IDs)
	for _, id := range ids {
		if err := s.DeleteProject(ctx, id); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) ensureShortURLAvailable(ctx context.Context, shortURL string) (string, error) {
	shortURL = strings.TrimSpace(shortURL)
	if shortURL == "" {
		for i := 0; i < 5; i++ {
			candidate := contentutil.GenerateRandomShortURL()
			_, err := s.repo.GetProjectByShortURL(ctx, candidate)
			if err != nil {
				if errors.Is(err, domainproject.ErrProjectNotFound) {
					return candidate, nil
				}
				return "", err
			}
		}
		return "", domainproject.ErrProjectShortURLExists
	}

	existing, err := s.repo.GetProjectByShortURL(ctx, shortURL)
	if err != nil && !errors.Is(err, domainproject.ErrProjectNotFound) {
		return "", err
	}
	if err == nil && existing != nil {
		return "", domainproject.ErrProjectShortURLExists
	}
	return shortURL, nil
}

func normalizeStatus(status string) string {
	status = strings.TrimSpace(status)
	if status == "" {
		return "进行中"
	}
	return status
}

func normalizeIDs(ids []int64) []int64 {
	if len(ids) == 0 {
		return nil
	}
	seen := make(map[int64]struct{}, len(ids))
	out := make([]int64, 0, len(ids))
	for _, id := range ids {
		if id <= 0 {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}
