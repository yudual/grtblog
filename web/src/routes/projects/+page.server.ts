import { getProjectList } from '$lib/features/project/api';
import { trackISRDeps } from '$lib/server/isr-deps';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	trackISRDeps(event, 'project:list');
	const data = await getProjectList(event.fetch);
	return { projects: data.items };
};
