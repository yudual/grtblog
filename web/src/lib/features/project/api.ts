import { getApi, fetchOrNull } from '$lib/shared/clients/api';
import { projectData } from './data';
import type { ProjectDetail, ProjectListResponse, ProjectStatus, ProjectSummary } from './types';

type ProjectItemDTO = {
	id: number;
	title: string;
	summary?: string | null;
	cover?: string | null;
	status: string;
	shortUrl: string;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

type ProjectDetailDTO = ProjectItemDTO & {
	content: string;
	authorId: number;
};

type ProjectListDTO = {
	items: ProjectItemDTO[];
	total: number;
	page: number;
	size: number;
};

const toSummary = (project: ProjectItemDTO | ProjectDetail): ProjectSummary => {
	return {
		slug: 'shortUrl' in project ? project.shortUrl : project.slug,
		title: project.title,
		summary: project.summary ?? '',
		cover: project.cover ?? undefined,
		status: (project.status || undefined) as ProjectStatus | undefined,
		updatedAt: project.updatedAt
	};
};

export const getProjectList = async (fetcher?: typeof fetch): Promise<ProjectListResponse> => {
	const api = getApi(fetcher);
	const result = await api<ProjectListDTO>('/projects?page=1&pageSize=100').catch(() => null);
	if (result && Array.isArray(result.items)) {
		return {
			items: result.items.map(toSummary),
			total: result.total
		};
	}
	const items = projectData.map(toSummary);
	return { items, total: items.length };
};

export const getProjectDetail = async (
	fetcher: typeof fetch | undefined,
	slug: string
): Promise<ProjectDetail | null> => {
	const api = getApi(fetcher);
	const result = await fetchOrNull(() =>
		api<ProjectDetailDTO>(`/projects/short/${encodeURIComponent(slug)}`)
	);
	if (result) {
		return {
			...toSummary(result),
			content: result.content,
			related: []
		};
	}
	return projectData.find((project) => project.slug === slug) ?? null;
};
