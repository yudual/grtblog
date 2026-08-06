import { error } from '@sveltejs/kit';
import { getProjectDetail } from '$lib/features/project/api';
import { trackISRDeps } from '$lib/server/isr-deps';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const project = await getProjectDetail(event.fetch, event.params.slug);
	if (!project) error(404, 'Project not found');

	trackISRDeps(event, `project:detail:${project.slug}`);
	return { project };
};
