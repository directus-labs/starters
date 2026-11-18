import type { Globals, Language, NavigationItem } from './schema';

/**
 * Locale type - full locale code (e.g., 'en-US', 'es-ES')
 * @see ~/lib/i18n/config for the source definition
 */
export type Locale = string;

/**
 * A navigation link as /api/site-data fetches it. The generated schema types allow every
 * relation to be an id or an object; here the page, post and children are always expanded
 * to the few fields the header and footer need. Translations are already merged in.
 */
export interface SiteNavigationItem {
	id: string;
	title?: string | null;
	url?: string | null;
	type?: NavigationItem['type'];
	page?: { id: string; permalink?: string | null } | null;
	post?: { id: string; slug?: string | null } | null;
	children?: SiteNavigationItem[] | null;
}

/** A navigation menu (header or footer) with its links expanded. */
export interface SiteNavigation {
	id: string;
	title?: string | null;
	items?: SiteNavigationItem[] | null;
}

/** The globals fields /api/site-data reads. File fields stay ids, since they aren't expanded. */
export type SiteGlobals = Pick<Globals, 'title' | 'description' | 'social_links' | 'accent_color'> & {
	logo?: string | null;
	logo_dark_mode?: string | null;
	favicon?: string | null;
};

/**
 * Site data structure returned from /api/site-data endpoint
 */
export interface SiteData {
	globals: SiteGlobals;
	headerNavigation: SiteNavigation;
	footerNavigation: SiteNavigation;
	languages: Language[];
	locale: Locale;
	localeMap: Record<Locale, string>;
	directionMap: Record<Locale, 'ltr' | 'rtl'>;
	direction: 'ltr' | 'rtl';
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}
