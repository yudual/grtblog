import { resolveHomeThemeConfig } from '$lib/features/home/theme';
import { getRecentPosts } from '$lib/features/post/api';
import { getRecentMoments } from '$lib/features/moment/api';
import { trackISRDeps } from '$lib/server/isr-deps';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { fetch } = event;
	const parentData = await event.parent();
	const homeTheme = resolveHomeThemeConfig(parentData.websiteInfo);

	trackISRDeps(
		event,
		'home:recent-posts',
		'home:recent-moments'
	);

	const [recentPosts, recentMoments] = await Promise.all([
		getRecentPosts(fetch),
		getRecentMoments(fetch)
	]);

	return {
		recentPosts,
		recentMoments,
		homeTheme
	};
};
