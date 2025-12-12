/**
 * Simple locale configuration
 * Locale is extracted from URL path and used directly in Directus queries
 */

export const DEFAULT_LOCALE = 'en-US';

export type Locale = string;

/**
 * Get locale code from locale string (e.g., 'en-US' -> 'en')
 */
export function getLocaleCode(locale: Locale): string {
	const parts = locale.split('-');

	return parts[0]?.toLowerCase() || locale.toLowerCase();
}

/**
 * Convert locale code to full locale format (e.g., 'en' -> 'en-US', 'fr' -> 'fr-FR')
 * This maps URL codes to Directus language codes
 */
export function codeToLocale(code: string): Locale {
	const codeMap: Record<string, Locale> = {
		en: 'en-US',
		fr: 'fr-FR',
		es: 'es-ES',
		de: 'de-DE',
		it: 'it-IT',
		pt: 'pt-BR',
		ru: 'ru-RU',
	};

	return codeMap[code.toLowerCase()] || code;
}
