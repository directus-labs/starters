/**
 * Locale map (short URL code -> locale, from the Directus languages collection).
 * The server locale middleware loads it per request; useState carries it to the client so locale
 * detection in the browser uses the same languages as the server.
 */
import { DEFAULT_LOCALE, getLocaleCode, type Locale } from '~/lib/i18n/config';

export function useLocaleMap() {
	const event = import.meta.server ? useRequestEvent() : undefined;

	return useState<Record<string, Locale>>(
		'locale-map',
		() => event?.context.localeMap ?? { [getLocaleCode(DEFAULT_LOCALE)]: DEFAULT_LOCALE },
	);
}
