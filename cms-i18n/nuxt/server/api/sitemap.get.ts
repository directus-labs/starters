import type { SitemapUrlInput } from '#sitemap/types';
import { DEFAULT_LOCALE, getLocaleCode, buildLocaleMap } from '~/lib/i18n/config';
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
		const pageUrls: SitemapUrlInput[] = [];
		for (const page of pages) {
			const permalink = `/${page.permalink?.replace(/^\/+/, '') || ''}`;

			// Add entry for each locale
			for (const locale of allLocales) {
				const localizedPath = addLocaleToPath(permalink, locale);

				// Build alternates for this page
				const alternates: Record<string, string> = {};
				for (const altLocale of allLocales) {
					const altPath = addLocaleToPath(permalink, altLocale);
					alternates[getLocaleCode(altLocale)] = altPath;
				}

				pageUrls.push({
					loc: localizedPath,
					alternatives: Object.entries(alternates).map(([hreflang, href]) => ({
						hreflang,
						href,
					})),
				});
			}
		}

		const postUrls: SitemapUrlInput[] = [];
		for (const post of posts) {
			const blogPath = `/blog/${post.slug}`;

			// Add entry for each locale
			for (const locale of allLocales) {
				const localizedPath = addLocaleToPath(blogPath, locale);

				// Build alternates for this post
				const alternates: Record<string, string> = {};
				for (const altLocale of allLocales) {
					const altPath = addLocaleToPath(blogPath, altLocale);
					alternates[getLocaleCode(altLocale)] = altPath;
				}

				postUrls.push({
					loc: localizedPath,
					alternatives: Object.entries(alternates).map(([hreflang, href]) => ({
						hreflang,
						href,
					})),
				});
			}
		}

		return [...pageUrls, ...postUrls];
	} catch {
		return [];
	}
});
