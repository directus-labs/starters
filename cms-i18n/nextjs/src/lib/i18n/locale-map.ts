/**
 * Locale map (short URL code -> locale) for the middleware, from the Directus languages collection.
 *
 * Middleware runs on every request and can't use the React-cached server helpers, so this keeps the
 * map in memory for a minute. If Directus is unreachable it keeps using the last map it loaded.
 */
import { DEFAULT_LOCALE, buildLocaleMap, getLocaleCode, type Locale } from './config';

const CACHE_TTL_MS = 60_000;
const defaultMap: Record<string, Locale> = { [getLocaleCode(DEFAULT_LOCALE)]: DEFAULT_LOCALE };

let cached: { map: Record<string, Locale>; expiresAt: number } | null = null;

export async function getLocaleMap(): Promise<Record<string, Locale>> {
	if (cached && cached.expiresAt > Date.now()) {
		return cached.map;
	}

	try {
		// The Public policy can read languages, so no token is needed.
		const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/languages?fields=code&limit=-1`);
		if (!response.ok) throw new Error(`Directus responded ${response.status}`);

		const { data } = (await response.json()) as { data: Array<{ code: string }> };
		cached = { map: { ...defaultMap, ...buildLocaleMap(data) }, expiresAt: Date.now() + CACHE_TTL_MS };
	} catch (error) {
		console.error('Could not load languages for locale routing:', error);
		cached = { map: cached?.map ?? defaultMap, expiresAt: Date.now() + CACHE_TTL_MS };
	}

	return cached.map;
}
