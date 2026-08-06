import { projectData } from './data';
import type { ProjectDetail, ProjectListResponse, ProjectSummary } from './types';

const toSummary = (project: ProjectDetail): ProjectSummary => {
	return {
		slug: project.slug,
		title: project.title,
		summary: project.summary,
		cover: project.cover,
		status: project.status,
		updatedAt: project.updatedAt
	};
};

export const getProjectList = async (fetcher?: typeof fetch): Promise<ProjectListResponse> => {
	void fetcher;
	const items = projectData.map(toSummary);
	return { items, total: items.length };
};

export const getProjectDetail = async (
	fetcher: typeof fetch | undefined,
	slug: string
): Promise<ProjectDetail | null> => {
	void fetcher;
	return projectData.find((project) => project.slug === slug) ?? null;
};
