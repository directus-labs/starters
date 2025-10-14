import { fetchPageData } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	return {}
	const data = await fetchPageData(event.url.pathname, 1, event.fetch);
	return data;
}) satisfies PageServerLoad;
