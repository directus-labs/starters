import { DEFAULT_LOCALE, buildLocaleMap, type Locale } from '~/lib/i18n/config';
import {
	buildTranslationsDeep,
	buildGlobalsFields,
	buildNavigationFields,
	mergeTranslations,
} from '../utils/directus-i18n';
import type { Globals, Language, Navigation } from '#shared/types/schema';

export default defineEventHandler(async (event) => {
	const locale = getLocaleFromEvent(event);
	const includeTranslations = locale !== DEFAULT_LOCALE;

	try {
		// Fetch languages first so we can build locale map
		const languages = (await directusServer.request(
			readItems('languages', {
				fields: ['code', 'name', 'direction'],
				sort: ['code'],
			}),
		)) as Language[];

		const localeMap = buildLocaleMap(languages);
		const directionMap = Object.fromEntries(languages.map((lang) => [lang.code, lang.direction || 'ltr'])) as Record<
			Locale,
			'ltr' | 'rtl'
		>;

		// Build all supported locales
		const allLocales = languages.map((lang) => lang.code);
		if (!allLocales.includes(DEFAULT_LOCALE)) {
			allLocales.unshift(DEFAULT_LOCALE);
		}
		const supportedLocales = allLocales.length > 0 ? allLocales : [DEFAULT_LOCALE];

		// Build locale names map
		const localeNames =
			languages.length > 0
				? (Object.fromEntries([
						[DEFAULT_LOCALE, 'English'],
						...languages.map((lang) => [lang.code, lang.name || lang.code]),
					]) as Record<Locale, string>)
				: ({ [DEFAULT_LOCALE]: 'English' } as Record<Locale, string>);

		// Build fields
		const globalsFields = buildGlobalsFields(includeTranslations);
		const navigationFields = buildNavigationFields(includeTranslations);

		// Fetch globals and navigation with translations if needed
		const [globalsRaw, headerNavigationRaw, footerNavigationRaw] = await Promise.all([
			directusServer.request<Globals>(
				readSingleton('globals', {
					// @ts-expect-error - Directus SDK has strict field typing that doesn't support dynamic fields
					fields: globalsFields,
					...(includeTranslations ? { deep: buildTranslationsDeep(locale) } : {}),
				}),
			),
			directusServer.request<Navigation>(
				readItem('navigation', 'main', {
					// @ts-expect-error - Directus SDK has strict field typing that doesn't support dynamic fields
					fields: navigationFields,
					deep: {
						items: {
							_sort: ['sort'],
							...(includeTranslations ? buildTranslationsDeep(locale) : {}),
							children: {
								_sort: ['sort'],
								...(includeTranslations ? buildTranslationsDeep(locale) : {}),
							},
						},
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
			directusServer.request<Navigation>(
				readItem('navigation', 'footer', {
					// @ts-expect-error - Directus SDK has strict field typing that doesn't support dynamic fields
					fields: navigationFields,
					deep: {
						items: {
							_sort: ['sort'],
							...(includeTranslations ? buildTranslationsDeep(locale) : {}),
							children: {
								_sort: ['sort'],
								...(includeTranslations ? buildTranslationsDeep(locale) : {}),
							},
						},
						...(includeTranslations ? buildTranslationsDeep(locale) : {}),
					},
				}),
			),
		]);

		// Merge translations if needed
		const globals = includeTranslations ? mergeTranslations(globalsRaw, locale) : globalsRaw;
		const headerNavigation = includeTranslations ? mergeTranslations(headerNavigationRaw, locale) : headerNavigationRaw;
		const footerNavigation = includeTranslations ? mergeTranslations(footerNavigationRaw, locale) : footerNavigationRaw;

		// Get direction for current locale
		const direction = directionMap[locale] || 'ltr';

		return {
			globals,
			headerNavigation,
			footerNavigation,
			languages,
			locale,
			localeMap,
			directionMap,
			direction,
			supportedLocales,
			localeNames,
		};
	} catch (error) {
		console.error('Error fetching site data:', error);
		throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
	}
});
