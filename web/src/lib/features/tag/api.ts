import { getApi } from '$lib/shared/clients/api';
import type { PublicTag, TagContents } from './types';

export const getTagContents = async (
	fetcher: typeof fetch | undefined,
	id: number
): Promise<TagContents> => {
	const api = getApi(fetcher);
	const result = await api<TagContents>(`/tags/${id}/contents`).catch(() => null);
	return result ?? { articles: [], moments: [] };
};

export const getPublicTags = async (fetcher: typeof fetch | undefined): Promise<PublicTag[]> => {
	const api = getApi(fetcher);
	const result = await api<PublicTag[]>('/public/tags').catch(() => null);
	return result ?? [];
};
