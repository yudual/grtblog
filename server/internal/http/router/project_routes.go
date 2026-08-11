package router

import (
	"github.com/gofiber/fiber/v2"

	appproject "github.com/grtsinry43/grtblog-v2/server/internal/app/project"
	"github.com/grtsinry43/grtblog-v2/server/internal/http/handler"
	"github.com/grtsinry43/grtblog-v2/server/internal/http/middleware"
	"github.com/grtsinry43/grtblog-v2/server/internal/infra/persistence"
)

func registerProjectPublicRoutes(v2 fiber.Router, deps Dependencies) {
	projectHandler := newProjectHandler(deps)

	publicGroup := v2.Group("/projects")
	publicGroup.Get("/", projectHandler.ListProjects)          // GET /api/v2/projects
	publicGroup.Get("/short/:shortUrl", projectHandler.GetProjectByShortURL) // GET /api/v2/projects/short/:shortUrl
}

func registerProjectAuthRoutes(v2 fiber.Router, deps Dependencies) {
	projectHandler := newProjectHandler(deps)
	identityRepo := persistence.NewIdentityRepository(deps.DB)
	adminTokenRepo := persistence.NewAdminTokenRepository(deps.DB)

	authGroup := v2.Group("/projects", middleware.RequireAuth(deps.JWTManager, identityRepo, adminTokenRepo), middleware.RequireAdmin(identityRepo))
	authGroup.Post("/", projectHandler.CreateProject)  // POST /api/v2/projects
	authGroup.Put("/:id", projectHandler.UpdateProject) // PUT /api/v2/projects/:id
	authGroup.Delete("/:id", projectHandler.DeleteProject) // DELETE /api/v2/projects/:id

	adminGroup := v2.Group("/admin", middleware.RequireAuth(deps.JWTManager, identityRepo, adminTokenRepo), middleware.RequireAdmin(identityRepo))
	adminGroup.Get("/projects/:id", projectHandler.GetProjectAdmin)             // GET /api/v2/admin/projects/:id
	adminGroup.Get("/projects", projectHandler.ListProjectsAdmin)               // GET /api/v2/admin/projects
	adminGroup.Put("/projects/published", projectHandler.BatchSetProjectPublished) // PUT /api/v2/admin/projects/published
	adminGroup.Post("/projects/batch-delete", projectHandler.BatchDeleteProjects)  // POST /api/v2/admin/projects/batch-delete
}

func newProjectHandler(deps Dependencies) *handler.ProjectHandler {
	projectRepo := persistence.NewProjectRepository(deps.DB)
	projectSvc := appproject.NewService(projectRepo, deps.EventBus)
	return handler.NewProjectHandler(projectSvc)
}
