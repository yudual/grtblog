import { fetchNavMenuTree } from '$lib/features/navigation/api';
import type { NavMenuItem } from '$lib/features/navigation/types';
import type { HealthSSRData } from '$lib/features/site-health/store.svelte';
import { trackISRDeps } from '$lib/server/isr-deps';
import { fetchWebsiteInfo } from '$lib/features/website-info/api';
import type { WebsiteInfoMap } from '$lib/features/website-info/types';
import type { LayoutServerLoad } from './$types';

const defaultInternalBaseURL = 'http://127.0.0.1:8080';

const isRemovedMenu = (url: string): boolean => {
	const pathname = url.split('?')[0].replace(/\/+$/, '') || '/';
	return (
		pathname === '/thinkings' || pathname.startsWith('/thinkings/page/') || pathname === '/friends'
	);
};

const removeRemovedMenus = (items: NavMenuItem[]): NavMenuItem[] =>
	items
		.filter((item) => !isRemovedMenu(item.url))
		.map((item) =>
			item.children ? { ...item, children: removeRemovedMenus(item.children) } : item
		);

const normalizeMenuPath = (url: string): string => url.split('?')[0].replace(/\/+$/, '') || '/';

const hasMenuPath = (items: NavMenuItem[], path: string): boolean =>
	items.some(
		(item) =>
			normalizeMenuPath(item.url) === path ||
			(item.children ? hasMenuPath(item.children, path) : false)
	);

const ensureProjectMenu = (items: NavMenuItem[]): NavMenuItem[] =>
	hasMenuPath(items, '/projects')
		? items
		: [...items, { id: 1001, name: '项目', url: '/projects', icon: 'folder' }];

function resolveInternalBaseURL(): string {
	if (typeof process === 'undefined' || !process.env) return defaultInternalBaseURL;
	const raw = (process.env.INTERNAL_API_BASE_URL || '').trim();
	if (!raw) return defaultInternalBaseURL;
	// Strip /api/v2 suffix if present to get the root.
	return raw.replace(/\/api\/v2\/?$/, '').replace(/\/+$/, '') || defaultInternalBaseURL;
}

export const load: LayoutServerLoad = async (event) => {
	const { fetch } = event;
	trackISRDeps(event, 'layout:nav', 'layout:website-info');

	let navMenus: NavMenuItem[];
	let websiteInfo: WebsiteInfoMap;
	let healthData: HealthSSRData = { maintenance: false, healthMode: 'healthy', isDev: false };

	const defaultNav: NavMenuItem[] = [
		{ id: 1, name: '首页', url: '/', icon: 'house' },
		{ id: 2, name: '文章', url: '/posts', icon: 'book-open' },
		{ id: 3, name: '手记', url: '/moments', icon: 'feather' },
		{ id: 4, name: '时间线', url: '/timeline', icon: 'clock' },
		{ id: 5, name: '项目', url: '/projects', icon: 'folder' }
	];

	const defaultSiteInfo: WebsiteInfoMap = {
		website_name: 'Yu的博客空间',
		description: '静态优先、极速响应的现代化博客平台',
		home_title: 'Yu的博客空间',
		favicon: 'https://api.dicebear.com/7.x/bottts/svg?seed=yushao'
	};

	try {
		const resNav = await fetchNavMenuTree(fetch).catch(() => null);
		const filteredNav = Array.isArray(resNav) ? removeRemovedMenus(resNav) : [];
		navMenus = filteredNav.length > 0 ? ensureProjectMenu(filteredNav) : defaultNav;

		const resSite = await fetchWebsiteInfo(fetch).catch(() => null);
		websiteInfo =
			resSite && typeof resSite === 'object' && Object.keys(resSite).length > 0
				? resSite
				: defaultSiteInfo;
	} catch {
		navMenus = defaultNav;
		websiteInfo = defaultSiteInfo;
	}

	// Fetch health/readiness (non-blocking — defaults to healthy on failure).
	try {
		const baseURL = resolveInternalBaseURL();
		const resp = await fetch(`${baseURL}/health/readiness`, {
			signal: AbortSignal.timeout(2000)
		});
		if (resp.ok) {
			const envelope = await resp.json();
			const data = envelope?.data;
			if (data) {
				healthData = {
					maintenance: data.maintenance === true,
					healthMode: typeof data.healthMode === 'string' ? data.healthMode : 'healthy',
					isDev: data.isDev === true
				};
			}
		}
	} catch {
		// Ignore — default to healthy.
	}

	return {
		navMenus,
		websiteInfo,
		healthData
	};
};
