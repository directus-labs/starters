import type { SitemapUrlInput } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
	try {
		const pagesPromise = directusServer.request(
			readItems('pages', {
				fields: ['permalink'],
			}),
		);

		const postsPromise = directusServer.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' } },
				fields: ['slug'],
			}),
		);

		const [pages, posts] = await Promise.all([pagesPromise, postsPromise]);

		const pageUrls = pages.map((page) => ({
			loc: `/${page.permalink}`,
		}));

		const postUrls = posts.map((post) => ({
			loc: `/blog/${post.slug}`,
		}));

		return [...pageUrls, ...postUrls] satisfies SitemapUrlInput[];
	} catch {
		return [];
	}
});
