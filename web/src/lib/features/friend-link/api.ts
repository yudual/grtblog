import { getApi } from '$lib/shared/clients/api';
import type { FriendLink, FriendApplyForm, FriendLinkApplyConfig } from './types';

/**
 * 获取公开友邻列表 - 用于 SvelteKit load 函数 (强 SEO)
 */
export const getFriendLinks = async (fetcher?: typeof fetch): Promise<FriendLink[]> => {
	const api = getApi(fetcher);
	const res = await api<FriendLink[]>('/public/friend-links').catch(() => null);
	return res ?? [];
};

/**
 * 获取友链申请配置 - 用于 SvelteKit load 函数
 */
export const getFriendLinkApplyConfig = async (
	fetcher?: typeof fetch
): Promise<FriendLinkApplyConfig> => {
	const api = getApi(fetcher);
	const res = await api<FriendLinkApplyConfig>('/public/friend-links/apply-config').catch(
		() => null
	);
	return (
		res ?? {
			enabled: true,
			requirements: '欢迎互换友链，请确保站点内容健康丰富！'
		}
	);
};

/**
 * 提交友链申请 - 客户端异步操作
 */
export const applyFriendLink = async (form: FriendApplyForm): Promise<void> => {
	const api = getApi(); // 客户端 fetcher 留空
	return api<void>('/friend-links/applications', {
		method: 'POST',
		body: form
	});
};
