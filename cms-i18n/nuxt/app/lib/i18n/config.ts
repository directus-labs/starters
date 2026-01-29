/**
 * i18n Configuration
 * URLs use short codes (en, es) while Directus uses full locale codes (en-US, es-ES).
 * Default locale has no URL prefix for cleaner URLs.
 *
 * Languages come from Directus as the source of truth
 */
export const DEFAULT_LOCALE = 'en-US';
export type Locale = string;

/**
 * Converts full locale to short code for URLs (e.g., 'en-US' -> 'en').
 */
export function getLocaleCode(locale: Locale): string {
	const parts = locale.split('-');

	return parts[0]?.toLowerCase() || locale.toLowerCase();
}

/**
 * Converts short URL code to full Directus locale.
 * Uses provided mapping from Directus languages collection, or falls back to common patterns.
 *
 * @param code - Short code from URL (e.g., 'en', 'fr')
 * @param localeMap - Optional mapping from short codes to full locale codes (from Directus languages collection)
 * @returns Full locale code (e.g., 'en-US', 'fr-FR')
 */
export function codeToLocale(code: string, localeMap?: Record<string, Locale>): Locale {
	const lowerCode = code.toLowerCase();

	if (localeMap && localeMap[lowerCode]) {
		return localeMap[lowerCode];
	}

	// Fallback needed for middleware that runs before Directus languages are fetched.
	// These patterns should match your Directus languages collection configuration.
	const commonPatterns: Record<string, Locale> = {
		en: 'en-US',
		fr: 'fr-FR',
		es: 'es-ES',
		de: 'de-DE',
		it: 'it-IT',
		pt: 'pt-BR',
		ru: 'ru-RU',
		ar: 'ar-SA',
	};

	return commonPatterns[lowerCode] || code;
}

/**
 * Builds a mapping from short codes to full locale codes from Directus languages.
 *
 * @param languages - Array of languages from Directus
 * @returns Mapping from short code to full locale code
 */
export function buildLocaleMap(languages: Array<{ code: string }>): Record<string, Locale> {
	const map: Record<string, Locale> = {};

	for (const lang of languages) {
		const shortCode = getLocaleCode(lang.code);
		map[shortCode] = lang.code;
	}

	return map;
}
