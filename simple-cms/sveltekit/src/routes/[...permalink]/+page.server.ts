import { fetchPageData } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
    const data = await fetchPageData(url.pathname)
    return data;
}) satisfies PageServerLoad;