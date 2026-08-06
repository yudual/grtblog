import { getApi } from '$lib/shared/clients/api';
import type { ThinkingItem, ThinkingListResponse } from '$lib/features/thinking/types';

type ThinkingListOptions = {
	page?: number;
	pageSize?: number;
};

const fallbackThinkings: ThinkingItem[] = [
	{
		id: 1,
		commentId: 0,
		content:
			'做博客系统最迷人的地方在于：静态先行保障极致速度，实时注水赋予生机活力，联合协议连接思想孤岛。',
		authorId: 0,
		views: 0,
		likes: 0,
		comments: 0,
		createdAt: '2026-08-02T10:00:00Z',
		updatedAt: '2026-08-02T10:00:00Z'
	},
	{
		id: 2,
		commentId: 0,
		content: '极简的 UI 架构不等于简单的功能。用精制的组件与平滑的微动画为创作者带来惊艳体验！',
		authorId: 0,
		views: 0,
		likes: 0,
		comments: 0,
		createdAt: '2026-08-01T15:30:00Z',
		updatedAt: '2026-08-01T15:30:00Z'
	}
];

export const getThinkingList = async (
	fetcher?: typeof fetch,
	{ page = 1, pageSize = 10 }: ThinkingListOptions = {}
): Promise<ThinkingListResponse> => {
	const api = getApi(fetcher);
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize)
	});
	const result = await api<ThinkingListResponse>(`/thinkings?${query.toString()}`).catch(
		() => null
	);
	const data = result ?? {
		items: fallbackThinkings,
		total: 2
	};
	return { ...data, page, size: pageSize };
};
