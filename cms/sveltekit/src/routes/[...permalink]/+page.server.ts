import { fetchPageData, fetchPageDataById, getPageIdByPermalink } from '$lib/directus/fetchers';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { DIRECTUS_SERVER_TOKEN } from '$env/static/private';

export const load = (async (event) => {
	const id = event.url.searchParams.get('id') || '';
	let version = event.url.searchParams.get('version') || undefined;
	const preview = event.url.searchParams.get('preview') === 'true';
	const token = preview ? DIRECTUS_SERVER_TOKEN : undefined;

	// Live preview sends version=published (Directus v12+) or version=main (older Directus versions) for live content.
	// Neither key requires an explicit version parameter — strip both to fetch the default published version.
	// Versions are only read in preview mode; without preview=true, fall back to published content.
	version = preview && version !== 'published' && version !== 'main' ? version : undefined;

	let data;
	try {
		let pageId = id;
		if (version && !pageId) {
			const foundPageId = await getPageIdByPermalink(event.url.pathname, token);
			pageId = foundPageId || '';
		}

		if (pageId && version) {
			data = await fetchPageDataById(pageId, version, token);
		} else {
			data = await fetchPageData(event.url.pathname, 1, token, preview);
		}
	} catch (err) {
		console.error('Error loading page:', err);
		throw err;
	}

	// Unknown permalinks (including /robots.txt or /sitemap.xml when no route handles them) are 404s, not 500s.
	if (!data) {
		error(404, { message: 'Page not found' });
	}

	return data;
}) satisfies PageServerLoad;
