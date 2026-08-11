package handler

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	appproject "github.com/grtsinry43/grtblog-v2/server/internal/app/project"
	domainproject "github.com/grtsinry43/grtblog-v2/server/internal/domain/project"
	"github.com/grtsinry43/grtblog-v2/server/internal/http/contract"
	"github.com/grtsinry43/grtblog-v2/server/internal/http/middleware"
	"github.com/grtsinry43/grtblog-v2/server/internal/http/response"
)

type ProjectHandler struct {
	svc *appproject.Service
}

func NewProjectHandler(svc *appproject.Service) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {
	claims, ok := middleware.GetClaims(c)
	if !ok {
		return response.ErrorFromBiz[any](c, response.NotLogin)
	}

	var req contract.CreateProjectReq
	if err := c.BodyParser(&req); err != nil {
		return response.NewBizErrorWithCause(response.ParamsError, "请求体解析失败", err)
	}

	cmd := appproject.CreateProjectCmd{
		Title:       req.Title,
		Summary:     req.Summary,
		Cover:       req.Cover,
		Content:     req.Content,
		Status:      req.Status,
		ShortURL:    req.ShortURL,
		IsPublished: req.IsPublished,
	}

	created, err := h.svc.CreateProject(c.Context(), claims.UserID, cmd)
	if err != nil {
		if errors.Is(err, domainproject.ErrProjectShortURLExists) {
			return response.NewBizErrorWithMsg(response.ParamsError, "短链接已存在")
		}
		if errors.Is(err, domainproject.ErrProjectTitleRequired) {
			return response.NewBizErrorWithMsg(response.ParamsError, "项目标题不能为空")
		}
		return err
	}

	Audit(c, "project.create", map[string]any{
		"projectId": created.ID,
		"title":     created.Title,
		"userId":    claims.UserID,
	})

	return response.SuccessWithMessage(c, h.toProjectResp(created), "项目创建成功")
}

func (h *ProjectHandler) UpdateProject(c *fiber.Ctx) error {
	claims, ok := middleware.GetClaims(c)
	if !ok {
		return response.ErrorFromBiz[any](c, response.NotLogin)
	}

	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return response.NewBizErrorWithMsg(response.ParamsError, "无效的项目ID")
	}

	var req contract.UpdateProjectReq
	if err := c.BodyParser(&req); err != nil {
		return response.NewBizErrorWithCause(response.ParamsError, "请求体解析失败", err)
	}

	updated, err := h.svc.UpdateProject(c.Context(), appproject.UpdateProjectCmd{
		ID:          id,
		Title:       req.Title,
		Summary:     req.Summary,
		Cover:       req.Cover,
		Content:     req.Content,
		Status:      req.Status,
		ShortURL:    req.ShortURL,
		IsPublished: req.IsPublished,
	})
	if err != nil {
		if errors.Is(err, domainproject.ErrProjectShortURLExists) {
			return response.NewBizErrorWithMsg(response.ParamsError, "短链接已存在")
		}
		if errors.Is(err, domainproject.ErrProjectNotFound) {
			return response.NewBizErrorWithMsg(response.NotFound, "项目不存在")
		}
		if errors.Is(err, domainproject.ErrProjectTitleRequired) {
			return response.NewBizErrorWithMsg(response.ParamsError, "项目标题不能为空")
		}
		return err
	}

	Audit(c, "project.update", map[string]any{
		"projectId": updated.ID,
		"title":     updated.Title,
		"userId":    claims.UserID,
	})

	return response.SuccessWithMessage(c, h.toProjectResp(updated), "项目更新成功")
}

func (h *ProjectHandler) DeleteProject(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return response.NewBizErrorWithMsg(response.ParamsError, "无效的项目ID")
	}

	if err := h.svc.DeleteProject(c.Context(), id); err != nil {
		if errors.Is(err, domainproject.ErrProjectNotFound) {
			return response.NewBizErrorWithMsg(response.NotFound, "项目不存在")
		}
		return err
	}

	Audit(c, "project.delete", map[string]any{"projectId": id})

	return response.SuccessWithMessage[any](c, nil, "项目删除成功")
}

func (h *ProjectHandler) GetProjectByShortURL(c *fiber.Ctx) error {
	shortURL := c.Params("shortUrl")
	if shortURL == "" {
		return response.NewBizErrorWithMsg(response.ParamsError, "短链接不能为空")
	}

	p, err := h.svc.GetProjectByShortURL(c.Context(), shortURL)
	if err != nil {
		if errors.Is(err, domainproject.ErrProjectNotFound) {
			return response.NewBizErrorWithMsg(response.NotFound, "项目不存在")
		}
		return err
	}
	if !p.IsPublished {
		return response.NewBizErrorWithMsg(response.NotFound, "项目不存在")
	}

	return response.Success(c, h.toProjectResp(p))
}

func (h *ProjectHandler) ListProjects(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var search *string
	if s := c.Query("search"); s != "" {
		search = &s
	}

	projects, total, err := h.svc.ListPublicProjects(c.Context(), domainproject.ProjectListOptions{
		Page: page, PageSize: pageSize, Search: search,
	})
	if err != nil {
		return err
	}

	return response.Success(c, contract.ProjectListResp{
		Items: h.toProjectListItems(projects),
		Total: total,
		Page:  page,
		Size:  pageSize,
	})
}

func (h *ProjectHandler) GetProjectAdmin(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return response.NewBizErrorWithMsg(response.ParamsError, "无效的项目ID")
	}

	p, err := h.svc.GetProjectByID(c.Context(), id)
	if err != nil {
		if errors.Is(err, domainproject.ErrProjectNotFound) {
			return response.NewBizErrorWithMsg(response.NotFound, "项目不存在")
		}
		return err
	}

	return response.Success(c, h.toProjectResp(p))
}

func (h *ProjectHandler) ListProjectsAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("pageSize", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var search *string
	if s := c.Query("search"); s != "" {
		search = &s
	}
	var published *bool
	if p := c.Query("published"); p != "" {
		val := p == "true"
		published = &val
	}

	projects, total, err := h.svc.ListProjects(c.Context(), domainproject.ProjectListOptionsInternal{
		Page: page, PageSize: pageSize, Published: published, Search: search,
	})
	if err != nil {
		return err
	}

	return response.Success(c, contract.ProjectListResp{
		Items: h.toProjectListItems(projects),
		Total: total,
		Page:  page,
		Size:  pageSize,
	})
}

func (h *ProjectHandler) BatchSetProjectPublished(c *fiber.Ctx) error {
	var req contract.BatchSetProjectPublishedReq
	if err := c.BodyParser(&req); err != nil {
		return response.NewBizErrorWithCause(response.ParamsError, "请求体解析失败", err)
	}
	if len(req.IDs) == 0 {
		return response.NewBizErrorWithMsg(response.ParamsError, "ids 不能为空")
	}

	if err := h.svc.BatchSetPublished(c.Context(), appproject.BatchSetPublishedCmd{
		IDs: req.IDs, IsPublished: req.IsPublished,
	}); err != nil {
		return err
	}

	if req.IsPublished {
		return response.SuccessWithMessage[any](c, nil, "项目已批量发布")
	}
	return response.SuccessWithMessage[any](c, nil, "项目已批量取消发布")
}

func (h *ProjectHandler) BatchDeleteProjects(c *fiber.Ctx) error {
	var req contract.BatchDeleteProjectReq
	if err := c.BodyParser(&req); err != nil {
		return response.NewBizErrorWithCause(response.ParamsError, "请求体解析失败", err)
	}
	if len(req.IDs) == 0 {
		return response.NewBizErrorWithMsg(response.ParamsError, "ids 不能为空")
	}

	if err := h.svc.BatchDelete(c.Context(), appproject.BatchDeleteCmd{IDs: req.IDs}); err != nil {
		return err
	}

	return response.SuccessWithMessage[any](c, nil, "项目已批量删除")
}

func (h *ProjectHandler) toProjectResp(p *domainproject.Project) contract.ProjectResp {
	return contract.ProjectResp{
		ID:          p.ID,
		Title:       p.Title,
		Summary:     p.Summary,
		Cover:       p.Cover,
		Content:     p.Content,
		Status:      p.Status,
		ShortURL:    p.ShortURL,
		AuthorID:    p.AuthorID,
		IsPublished: p.IsPublished,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func (h *ProjectHandler) toProjectListItems(projects []*domainproject.Project) []contract.ProjectListItemResp {
	items := make([]contract.ProjectListItemResp, len(projects))
	for i, p := range projects {
		items[i] = contract.ProjectListItemResp{
			ID:          p.ID,
			Title:       p.Title,
			Summary:     p.Summary,
			Cover:       p.Cover,
			Status:      p.Status,
			ShortURL:    p.ShortURL,
			IsPublished: p.IsPublished,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		}
	}
	return items
}
