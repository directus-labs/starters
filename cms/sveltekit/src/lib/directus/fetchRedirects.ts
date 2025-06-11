// src/lib/fetchRedirects.ts
import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import { createDirectus, readItems, rest } from '@directus/sdk';

export interface SvelteRedirect {
	source: string;
	destination: string;
	permanent: boolean;
}

export async function fetchRedirects(): Promise<SvelteRedirect[]> {
	const directusUrl = PUBLIC_DIRECTUS_URL;
	if (!directusUrl) {
		console.error('Missing PUBLIC_DIRECTUS_URL!');
		return [];
	}

	try {
		const directus = createDirectus(directusUrl).with(rest());
		const items = await directus.request(
			readItems('redirects', { fields: ['url_from', 'url_to', 'response_code'] })
		);

		return items
			.filter(
				(r): r is { url_from: string; url_to: string; response_code: '301' | '302' } =>
					typeof r.url_from === 'string' &&
					typeof r.url_to === 'string' &&
					(r.response_code === '301' || r.response_code === '302')
			)
			.map((r) => ({
				source: r.url_from,
				destination: r.url_to,
				permanent: r.response_code === '301'
			}));
	} catch (e) {
		console.error('fetchRedirects error:', e);
		return [];
	}
}
