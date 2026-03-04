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
		// Key point: Create one entry PER language version of each page
		// Each entry lists ALL language alternatives (including itself)
		const urls: SitemapUrlInput[] = [];

		for (const page of pages) {
			const permalink = `/${page.permalink?.replace(/^\/+/, '') || ''}`;

			// Build alternates array (same for all language versions of this page)
			const alternates: Array<{ hreflang: string; href: string }> = allLocales.map((locale) => ({
				hreflang: getLocaleCode(locale),
				href: addLocaleToPath(permalink, locale),
			}));

			// Add x-default pointing to default locale
			alternates.push({
				hreflang: 'x-default',
				href: addLocaleToPath(permalink, DEFAULT_LOCALE),
			});

			// Create one entry for EACH language version
			for (const locale of allLocales) {
				const localizedPath = addLocaleToPath(permalink, locale);
				urls.push({
					loc: localizedPath,
					alternatives: alternates,
				});
			}
		}

		for (const post of posts) {
			const blogPath = `/blog/${post.slug}`;

			// Build alternates array (same for all language versions of this post)
			const alternates: Array<{ hreflang: string; href: string }> = allLocales.map((locale) => ({
				hreflang: getLocaleCode(locale),
				href: addLocaleToPath(blogPath, locale),
			}));

			// Add x-default pointing to default locale
			alternates.push({
				hreflang: 'x-default',
				href: addLocaleToPath(blogPath, DEFAULT_LOCALE),
			});

			// Create one entry for EACH language version
			for (const locale of allLocales) {
				const localizedPath = addLocaleToPath(blogPath, locale);
				urls.push({
					loc: localizedPath,
					alternatives: alternates,
				});
			}
		}

		return urls;
	} catch {
		return [];
	}
});
