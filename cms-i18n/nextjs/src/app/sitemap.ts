import { useDirectus } from '@/lib/directus/directus';
import { getLanguagesFromDirectus } from '@/lib/i18n/server';
import { DEFAULT_LOCALE, getLocaleCode } from '@/lib/i18n/config';
import { addLocaleToPath } from '@/lib/i18n/utils';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

type Locale = string;

/**
 * Builds the hreflang alternates map for a path across all locales.
 * Used for each sitemap entry so search engines know all language versions.
 */
function buildAlternateLanguages(path: string, siteUrl: string, allLocales: Locale[]): Record<string, string> {
	const alternates: Record<string, string> = {};
	for (const locale of allLocales) {
		alternates[getLocaleCode(locale)] = `${siteUrl}${addLocaleToPath(path, locale)}`;
	}
	alternates['x-default'] = `${siteUrl}${addLocaleToPath(path, DEFAULT_LOCALE)}`;

	return alternates;
}

/**
 * Creates one sitemap entry per locale for the given path, each with the same alternates.
 */
function buildSitemapEntriesForPath(
	path: string,
	lastModified: string,
	siteUrl: string,
	allLocales: Locale[],
): MetadataRoute.Sitemap {
	const alternateLanguages = buildAlternateLanguages(path, siteUrl, allLocales);

	return allLocales.map((locale) => ({
		url: `${siteUrl}${addLocaleToPath(path, locale)}`,
		lastModified,
		alternates: { languages: alternateLanguages },
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

	const { directus, readItems } = useDirectus();

	try {
		const { languages } = await getLanguagesFromDirectus();
		const allLocales = languages.map((lang) => lang.code);
		if (!allLocales.includes(DEFAULT_LOCALE)) {
			allLocales.unshift(DEFAULT_LOCALE);
		}

		const [pages, posts] = await Promise.all([
			directus.request(
				readItems('pages', {
					filter: { status: { _eq: 'published' } },
					fields: ['permalink', 'published_at'],
					limit: -1,
				}),
			),
			directus.request(
				readItems('posts', {
					filter: { status: { _eq: 'published' } },
					fields: ['slug', 'published_at'],
					limit: -1,
				}),
			),
		]);

		const pathEntries: Array<{ path: string; lastModified: string }> = [];

		for (const page of pages as Array<{ permalink?: string; published_at?: string | null }>) {
			if (!page.permalink) continue;
			pathEntries.push({
				path: `/${String(page.permalink).replace(/^\/+/, '')}`,
				lastModified: page.published_at ?? new Date().toISOString(),
			});
		}

		for (const post of posts as Array<{ slug?: string | null; published_at?: string | null }>) {
			if (!post.slug) continue;
			pathEntries.push({
				path: `/blog/${post.slug}`,
				lastModified: post.published_at ?? new Date().toISOString(),
			});
		}

		return pathEntries.flatMap(({ path, lastModified }) =>
			buildSitemapEntriesForPath(path, lastModified, siteUrl, allLocales),
		);
	} catch (error) {
		console.error('Error generating sitemap:', error);

		return [];
	}
}
