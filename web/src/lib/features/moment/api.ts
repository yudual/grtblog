import { getApi, fetchOrNull } from '$lib/shared/clients/api';
import type {
	MomentDetail,
	MomentLatestCheckResponse,
	MomentListResponse,
	MomentRelatedPost,
	MomentSummary
} from '$lib/features/moment/types';

type MomentListOptions = {
	page?: number;
	pageSize?: number;
};

const fallbackMoment: MomentSummary = {
	id: 1,
	title: '新站搭建记录',
	shortUrl: 'new-site-journal',
	summary: '今天天气不错，开始动手搭建全新个人网站！',
	views: 0,
	topics: [],
	likes: 0,
	comments: 0,
	isTop: false,
	isHot: false,
	isOriginal: true,
	contentUpdatedAt: '2026-08-02T14:00:00Z',
	createdAt: '2026-08-02T14:00:00Z',
	updatedAt: '2026-08-02T14:00:00Z'
};

const fallbackMomentDetail: MomentDetail = {
	...fallbackMoment,
	content: `今天开始动手搭建全新的个人网站。

这是一次从页面结构、内容组织到后台管理的重新整理，希望以后可以把文章、手记和做过的事情都好好记录下来。

## 新的开始

先把基础页面和内容流转起来，再慢慢补充真实的文章与项目记录。`,
	contentHash: 'fallback-new-site-journal-v1',
	authorId: 0,
	isPublished: true,
	topics: [],
	metrics: {
		views: 0,
		likes: 0,
		comments: 0
	},
	relatedPosts: []
};

export const getMomentList = async (
	fetcher?: typeof fetch,
	{ page = 1, pageSize = 10 }: MomentListOptions = {}
): Promise<MomentListResponse> => {
	const api = getApi(fetcher);
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});
	const result = await api<MomentListResponse>(`/moments?${query.toString()}`).catch(() => null);
	return (
		result ?? {
			items: [fallbackMoment],
			total: 1,
			page,
			size: pageSize
		}
	);
};

export const getMomentListByColumn = async (
	fetcher?: typeof fetch,
	columnSlug: string = '',
	{ page = 1, pageSize = 20 }: MomentListOptions = {}
): Promise<MomentListResponse> => {
	const api = getApi(fetcher);
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});
	const result = await api<MomentListResponse>(
		`/columns/short/${encodeURIComponent(columnSlug)}/moments?${query.toString()}`
	).catch(() => null);
	return result ?? { items: [], total: 0, page, size: pageSize };
};

export const getMomentDetail = async (
	fetcher: typeof fetch | undefined,
	shortUrl: string
): Promise<MomentDetail | null> => {
	const api = getApi(fetcher);
	const result = await fetchOrNull(() =>
		api<MomentDetail>(`/moments/short/${encodeURIComponent(shortUrl)}`)
	);
	return result ?? (shortUrl === fallbackMomentDetail.shortUrl ? fallbackMomentDetail : null);
};

export const checkMomentLatest = async (
	fetcher: typeof fetch | undefined,
	id: number,
	hash: string
): Promise<MomentLatestCheckResponse | null> => {
	const api = getApi(fetcher);
	const result = await api<MomentLatestCheckResponse>(`/moments/${id}/latest`, {
		method: 'POST',
		body: { hash }
	}).catch(() => null);
	return result ?? null;
};

export const getRecentMoments = async (fetcher?: typeof fetch): Promise<MomentListResponse> => {
	const api = getApi(fetcher);
	const result = await api<MomentListResponse>('/public/moments/recent').catch(() => null);
	return (
		result ?? {
			items: [fallbackMoment],
			total: 1,
			page: 1,
			size: 5
		}
	);
};

type MomentRelatedPostsResponse = {
	items: MomentRelatedPost[];
};

export const getMomentRelatedPosts = async (
	fetcher: typeof fetch | undefined,
	id: number
): Promise<MomentRelatedPost[]> => {
	const api = getApi(fetcher);
	const result = await api<MomentRelatedPostsResponse>(`/moments/${id}/same-period-articles`).catch(
		() => null
	);
	return result?.items ?? [];
};
