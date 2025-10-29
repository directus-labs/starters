import { fetchPageData } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const data = await fetchPageData(event.url.pathname, 1);
	return data;
}) satisfies PageServerLoad;
