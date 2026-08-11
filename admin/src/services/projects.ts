import { request } from './http'

export interface ProjectListItem {
  id: number
  title: string
  summary?: string | null
  cover?: string | null
  status: string
  shortUrl: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectListResponse {
  items: ProjectListItem[]
  total: number
  page: number
  size: number
}

export interface ProjectDetail extends ProjectListItem {
  content: string
  authorId: number
}

export interface ListProjectsParams {
  page?: number
  pageSize?: number
  published?: boolean
  search?: string
}

export interface CreateProjectPayload {
  title: string
  summary?: string | null
  cover?: string | null
  content: string
  status: string
  shortUrl?: string | null
  isPublished: boolean
}

export interface UpdateProjectPayload {
  title: string
  summary?: string | null
  cover?: string | null
  content: string
  status: string
  shortUrl: string
  isPublished: boolean
}

function stripEmpty<T extends object>(value: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== null && entry !== '',
    ),
  )
}

export function listProjects(params: ListProjectsParams) {
  return request<ProjectListResponse>('/admin/projects', {
    method: 'GET',
    query: stripEmpty(params),
  })
}

export function getProject(id: number) {
  return request<ProjectDetail>(`/admin/projects/${id}`, {
    method: 'GET',
  })
}

export function createProject(payload: CreateProjectPayload) {
  return request<ProjectDetail>('/projects', {
    method: 'POST',
    body: payload,
  })
}

export function updateProject(id: number, payload: UpdateProjectPayload) {
  return request<ProjectDetail>(`/projects/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteProject(id: number) {
  return request<void>(`/projects/${id}`, {
    method: 'DELETE',
  })
}

export function batchSetProjectPublished(payload: { ids: number[]; isPublished: boolean }) {
  return request<void>('/admin/projects/published', {
    method: 'PUT',
    body: payload,
  })
}

export function batchDeleteProjects(payload: { ids: number[] }) {
  return request<void>('/admin/projects/batch-delete', {
    method: 'POST',
    body: payload,
  })
}
