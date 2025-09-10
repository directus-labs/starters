import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const id = event.url.searchParams.get('id') || '';
	const version = event.url.searchParams.get('version') || '';
	const preview = event.url.searchParams.get('preview') === 'true';
	const token = event.url.searchParams.get('token') || '';

	try {
		let pageId = id;
		if (version && !pageId) {
			const foundPageId = await getPageIdByPermalink(
				event.url.pathname,
				token || undefined,
				event.fetch
			);
			pageId = foundPageId || '';
		}

		let data;
		if (pageId && version) {
			data = await fetchPageDataById(pageId, version, token || undefined, event.fetch);
		} else {
			data = await fetchPageData(event.url.pathname, 1, event.fetch, token || undefined, preview);
		}

		return data;
	} catch (error) {
		console.error('Error loading page:', error);
		throw error;
	}
}) satisfies PageServerLoad;
