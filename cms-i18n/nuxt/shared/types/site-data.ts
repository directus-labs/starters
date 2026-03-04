import type { Globals, Language, Navigation } from './schema';

/**
 * Locale type - full locale code (e.g., 'en-US', 'es-ES')
 * @see ~/lib/i18n/config for the source definition
 */
export type Locale = string;

/**
 * Site data structure returned from /api/site-data endpoint
 */
export interface SiteData {
	globals: Globals;
	headerNavigation: Navigation;
	footerNavigation: Navigation;
	languages: Language[];
	locale: Locale;
	localeMap: Record<Locale, string>;
	directionMap: Record<Locale, 'ltr' | 'rtl'>;
	direction: 'ltr' | 'rtl';
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}
