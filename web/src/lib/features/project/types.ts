export type ProjectStatus = '进行中' | '已完成' | '已归档';

export type ProjectSummary = {
	slug: string;
	title: string;
	summary: string;
	cover?: string;
	status?: ProjectStatus;
	updatedAt: string;
};

export type ProjectRelatedContent = {
	kind: 'post' | 'moment';
	title: string;
	summary?: string;
	href: string;
};

export type ProjectDetail = ProjectSummary & {
	content: string;
	related?: ProjectRelatedContent[];
};

export type ProjectListResponse = {
	items: ProjectSummary[];
	total: number;
};
