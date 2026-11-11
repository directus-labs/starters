/**
 * Server-side locale utilities for Nuxt.
 */
import type { H3Event } from 'h3';
import { getHeader, getQuery } from 'h3';
import { type Locale, DEFAULT_LOCALE, buildLocaleMap, getLocaleCode } from '~/lib/i18n/config';
import type { Language } from '#shared/types/schema';
import { directusServer, readItems } from './directus-server';

/**
 * Gets the locale from the event context, headers, or query parameters.
 *
 * @param event - H3 event from Nuxt server handler
 * @returns The locale code (defaults to DEFAULT_LOCALE)
 */
export function getLocaleFromEvent(event: H3Event): Locale {
	// First check event context (set by server middleware)
	if (event.context.locale) {
		return event.context.locale;
	}

	// Then check x-locale header (set by middleware or client)
	const headerLocale = getHeader(event, 'x-locale');

	if (headerLocale) {
		return headerLocale;
	}

	// Fallback to query parameter
	const query = getQuery(event);

	if (query.locale && typeof query.locale === 'string') {
		return query.locale;
	}

	return DEFAULT_LOCALE;
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
	try {
		const languages = (await directusServer.request(
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
	} catch {
		// Return defaults on error
		return {
			languages: [{ code: DEFAULT_LOCALE, name: 'English', direction: 'ltr' }],
			localeMap: { en: DEFAULT_LOCALE },
			directionMap: { [DEFAULT_LOCALE]: 'ltr' },
		};
	}
}

const LOCALE_MAP_TTL_MS = 60_000;
let cachedLocaleMap: { map: Record<string, Locale>; expiresAt: number } | null = null;

/**
 * Locale map (short URL code -> locale) for routing, cached in memory for a minute because the locale
 * middleware needs it on every page request. If Directus is unreachable it keeps using the last map it
 * loaded (or just the default locale on a cold start), so one failed request doesn't 404 every localized page.
 */
export async function getLocaleMap(): Promise<Record<string, Locale>> {
	if (cachedLocaleMap && cachedLocaleMap.expiresAt > Date.now()) {
		return cachedLocaleMap.map;
	}

	const defaultMap = { [getLocaleCode(DEFAULT_LOCALE)]: DEFAULT_LOCALE };

	try {
		// Not getLanguagesFromDirectus(): it hides failures behind a default map, which would then get cached.
		const languages = (await directusServer.request(readItems('languages', { fields: ['code'] }))) as Language[];
		cachedLocaleMap = {
			map: { ...defaultMap, ...buildLocaleMap(languages) },
			expiresAt: Date.now() + LOCALE_MAP_TTL_MS,
		};
	} catch (error) {
		console.error('Could not load languages for locale routing:', error);
		cachedLocaleMap = { map: cachedLocaleMap?.map ?? defaultMap, expiresAt: Date.now() + LOCALE_MAP_TTL_MS };
	}

	return cachedLocaleMap.map;
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
