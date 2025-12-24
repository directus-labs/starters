/**
 * Server-side locale access. Middleware sets x-locale header from URL.
 */
import 'server-only';
import { headers } from 'next/headers';
import { Locale, DEFAULT_LOCALE, buildLocaleMap } from './config';
import { useDirectus } from '@/lib/directus/directus';
import { readItems } from '@directus/sdk';
import type { Language } from '@/types/directus-schema';

export async function getLocaleFromHeaders(): Promise<Locale> {
	const headersList = await headers();
	const localeHeader = headersList.get('x-locale');

	return localeHeader || DEFAULT_LOCALE;
}

/**
 * Fetches languages from Directus and builds locale mapping.
 *
 * @returns Object with languages array, locale map, and direction map
 */
export async function getLanguagesFromDirectus(): Promise<{
	languages: Language[];
	localeMap: Record<string, Locale>;
	directionMap: Record<Locale, 'ltr' | 'rtl'>;
}> {
	const { directus } = useDirectus();

	try {
		const languages = (await directus.request(
			readItems('languages', {
				fields: ['code', 'name', 'direction'],
				sort: ['code'],
			}),
		)) as Language[];

		const localeMap = buildLocaleMap(languages);
		const directionMap = Object.fromEntries(languages.map((lang) => [lang.code, lang.direction])) as Record<
			Locale,
			'ltr' | 'rtl'
		>;

		return { languages, localeMap, directionMap };
	} catch (error) {
		console.error('Error fetching languages from Directus:', error);

		// Return defaults on error
		return {
			languages: [{ code: DEFAULT_LOCALE, name: 'English', direction: 'ltr' }],
			localeMap: { en: DEFAULT_LOCALE },
			directionMap: { [DEFAULT_LOCALE]: 'ltr' },
		};
	}
}

/**
 * Gets the text direction for a given locale.
 *
 * @param locale - The locale code
 * @param directionMap - Optional direction map from Directus
 * @returns 'ltr' or 'rtl'
 */
export async function getDirectionForLocale(
	locale: Locale,
	directionMap?: Record<Locale, 'ltr' | 'rtl'>,
): Promise<'ltr' | 'rtl'> {
	if (directionMap) {
		return directionMap[locale] || 'ltr';
	}

	// Fallback: fetch if not provided
	const { directionMap: map } = await getLanguagesFromDirectus();

	return map[locale] || 'ltr';
}
