import { PUBLIC_SITE_URL } from '$env/static/public';
import { useDirectus } from '$lib/directus/directus';
import type { RequestHandler } from './$types';

// Lists every published page and post, matching the sitemaps in the other CMS frontends.
export const GET: RequestHandler = async () => {
	if (!PUBLIC_SITE_URL) {
		throw new Error('Environment variable PUBLIC_SITE_URL is not set');
	}

	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus();

	try {
		const [pages, posts] = await Promise.all([
			directus.request(
				readItems('pages', {
					filter: { status: { _eq: 'published' } },
					fields: ['permalink', 'published_at'],
					limit: -1
				})
			),
			directus.request(
				readItems('posts', {
					filter: { status: { _eq: 'published' } },
					fields: ['slug', 'published_at'],
					limit: -1
				})
			)
		]);

		const entries = [
			...pages
				.filter((page) => page.permalink)
				.map((page) => ({
					url: `${PUBLIC_SITE_URL}${page.permalink}`,
					lastModified: page.published_at
				})),
			...posts
				.filter((post) => post.slug)
				.map((post) => ({
					url: `${PUBLIC_SITE_URL}/blog/${post.slug}`,
					lastModified: post.published_at
				}))
		];

		const urls = entries
			.map(
				(entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified || new Date().toISOString()}</lastmod>
  </url>`
			)
			.join('');

		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

		return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
	} catch (error) {
		console.error('Error generating sitemap:', error);

		return new Response('Failed to generate sitemap', { status: 500 });
	}
};
