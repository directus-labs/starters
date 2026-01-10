import type { SitemapUrlInput } from '#sitemap/types';
import { DEFAULT_LOCALE, getLocaleCode } from '~/lib/i18n/config';
import { addLocaleToPath } from '~/lib/i18n/utils';
import type { Language } from '#shared/types/schema';

export default defineSitemapEventHandler(async () => {
	try {
		// Fetch all languages to build sitemap with alternate language links
		const languagesPromise = directusServer.request(
			readItems('languages', {
				fields: ['code', 'name'],
				sort: ['code'],
			}),
		) as Promise<Language[]>;

		const pagesPromise = directusServer.request(
			readItems('pages', {
				fields: ['permalink'],
				filter: { status: { _eq: 'published' } },
			}),
		);

		const postsPromise = directusServer.request(
			readItems('posts', {
				filter: { status: { _eq: 'published' } },
				fields: ['slug'],
			}),
		);

		const [languages, pages, posts] = await Promise.all([languagesPromise, pagesPromise, postsPromise]);

		// Build list of all locales
		const allLocales = languages.map((lang) => lang.code);

		if (!allLocales.includes(DEFAULT_LOCALE)) {
			allLocales.unshift(DEFAULT_LOCALE);
		}

		// Build sitemap entries with alternate language links
		// Create one entry per page/post with alternate links pointing to all translations
		const pageUrls: SitemapUrlInput[] = [];

		for (const page of pages) {
			const permalink = `/${page.permalink?.replace(/^\/+/, '') || ''}`;

			// Use default locale as the main URL
			const mainPath = addLocaleToPath(permalink, DEFAULT_LOCALE);

			// Build alternates for all locales
			const alternates: Array<{ hreflang: string; href: string }> = [];

			for (const locale of allLocales) {
				const altPath = addLocaleToPath(permalink, locale);
				alternates.push({
					hreflang: getLocaleCode(locale),
					href: altPath,
				});
			}

			// Create single entry with alternate links
			pageUrls.push({
				loc: mainPath,
				alternatives: alternates,
			});
		}

		const postUrls: SitemapUrlInput[] = [];

		for (const post of posts) {
			const blogPath = `/blog/${post.slug}`;

			// Use default locale as the main URL
			const mainPath = addLocaleToPath(blogPath, DEFAULT_LOCALE);

			// Build alternates for all locales
			const alternates: Array<{ hreflang: string; href: string }> = [];

			for (const locale of allLocales) {
				const altPath = addLocaleToPath(blogPath, locale);
				alternates.push({
					hreflang: getLocaleCode(locale),
					href: altPath,
				});
			}

			// Create single entry with alternate links
			postUrls.push({
				loc: mainPath,
				alternatives: alternates,
			});
		}

		return [...pageUrls, ...postUrls];
	} catch {
		return [];
	}
});
