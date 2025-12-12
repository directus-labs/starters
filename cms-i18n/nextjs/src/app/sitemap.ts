import { useDirectus } from '@/lib/directus/directus';
import type { MetadataRoute } from 'next';
import { readItems } from '@directus/sdk';
import { addLocaleToPath } from '@/lib/i18n/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	if (!siteUrl) {
		throw new Error('Environment variable NEXT_PUBLIC_SITE_URL is not set');
	}

	const { directus, readItems } = useDirectus();

	try {
		const pagesPromise = directus.request(
			readItems('pages', {
				filter: { status: { _eq: 'published' } },
				fields: ['permalink', 'published_at'],
				limit: -1,
			}),
		);

		const postsPromise = directus.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' } },
				fields: ['slug', 'published_at'],
				limit: -1,
			}),
		);

		const languagesPromise = directus.request(
			readItems('languages', {
				fields: ['code'],
				sort: ['code'],
			}),
		).catch(() => []);

		const [pages, posts, languages] = await Promise.all([
			pagesPromise,
			postsPromise,
			languagesPromise,
		]);
		
		const supportedLocales = (languages as Array<{ code: string }>).map((lang) => lang.code);

		const sitemapEntries: MetadataRoute.Sitemap = [];

		// Generate sitemap entries for each locale
		for (const locale of supportedLocales) {
			// Add page URLs
			const pageUrls = pages
				.filter((page: { permalink: string; published_at: string | null | undefined }) => page.permalink)
				.map((page: { permalink: string; published_at: string | null | undefined }) => ({
					url: `${siteUrl}${addLocaleToPath(page.permalink, locale)}`,
					lastModified: page.published_at || new Date().toISOString(),
					alternates: {
						languages: Object.fromEntries(
							supportedLocales.map((altLocale) => [
								altLocale,
								`${siteUrl}${addLocaleToPath(page.permalink, altLocale)}`,
							]),
						),
					},
				}));

			// Add post URLs
			const postUrls = posts
				.filter((post: { slug: string | null | undefined; published_at: string | null | undefined }) => post.slug)
				.map((post: { slug: string | null | undefined; published_at: string | null | undefined }) => ({
					url: `${siteUrl}${addLocaleToPath(`/blog/${post.slug}`, locale)}`,
					lastModified: post.published_at || new Date().toISOString(),
					alternates: {
						languages: Object.fromEntries(
							supportedLocales.map((altLocale) => [
								altLocale,
								`${siteUrl}${addLocaleToPath(`/blog/${post.slug}`, altLocale)}`,
							]),
						),
					},
				}));

			sitemapEntries.push(...pageUrls, ...postUrls);
		}

		return sitemapEntries;
	} catch (error) {
		console.error('Error generating sitemap:', error);
		throw new Error('Failed to generate sitemap');
	}
}
