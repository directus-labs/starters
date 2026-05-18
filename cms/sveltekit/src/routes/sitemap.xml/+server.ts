import type { RequestHandler } from './$types';
import { useDirectus } from '$lib/directus/directus';
import { getRequestEvent } from '$app/server';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const { getDirectus, readItems } = useDirectus();
	const directus = getDirectus();

	try {
		const [pages, posts] = await Promise.all([
			directus.request(
				readItems('pages', {
					fields: ['permalink'],
				})
			),
			directus.request(
				readItems('posts', {
					filter: { status: { _eq: 'published' } },
					fields: ['slug'],
				})
			)
		]);

		// Get the site URL from the request event
		const siteUrl = url.origin;

		const urls = [
			...pages.map((page: any) => `${siteUrl}${page.permalink}`),
			...posts.map((post: any) => `${siteUrl}/blog/${post.slug}`),
		];

		setHeaders({
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
		});
		return new Response(
			`
		<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/__sitemap__/style.xsl"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
		</urlset>`.trim()
		);

	} catch {

		setHeaders({
			'content-type': 'application/xml; charset=utf-8',
		});

		return new Response(
			'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
		);
	}
};


