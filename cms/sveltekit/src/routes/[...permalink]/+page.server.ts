import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';

export const load = (async (event) => {
	const id = event.url.searchParams.get('id') || '';
	let version = event.url.searchParams.get('version') || undefined;
	const preview = event.url.searchParams.get('preview') === 'true';
	const token = preview ? DIRECTUS_SERVER_TOKEN : undefined;

	// Live preview adds version = main which is not required when fetching the main version.
	version = version !== 'main' ? version : undefined;

	try {
		let pageId = id;
		if (version && !pageId) {
			const foundPageId = await getPageIdByPermalink(event.url.pathname, token);
			pageId = foundPageId || '';
		}

		let data;
		if (pageId && version) {
			data = await fetchPageDataById(pageId, version, token);
		} else {
			data = await fetchPageData(event.url.pathname, 1, token, preview);
		}

		return data;
	} catch (error) {
		console.error('Error loading page:', error);
		throw error;
	}
}) satisfies PageServerLoad;
