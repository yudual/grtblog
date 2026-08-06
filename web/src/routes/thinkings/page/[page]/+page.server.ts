import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const rawPage = Number(params.page ?? '1');
	const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
	redirect(308, page === 1 ? '/moments/' : `/moments/page/${page}/`);
};
