import { Locale, DEFAULT_LOCALE, getLocaleCode, codeToLocale } from './config';

/**
 * Extract locale from URL path
 * If first segment looks like a locale code (2-3 letters), extract it and convert to full locale
 * Otherwise, use default locale
 */
export function getLocaleFromPath(pathname: string): { locale: Locale; pathWithoutLocale: string } {
	const segments = pathname.split('/').filter(Boolean);
	
	if (segments.length === 0) {
		return { locale: DEFAULT_LOCALE, pathWithoutLocale: '/' };
	}

	const firstSegment = segments[0];

	// Check if first segment looks like a locale code (2-3 letters)
	if (firstSegment.length >= 2 && firstSegment.length <= 3 && /^[a-z]{2,3}$/i.test(firstSegment)) {
		const locale = codeToLocale(firstSegment.toLowerCase());
		const pathWithoutLocale = '/' + segments.slice(1).join('/') || '/';
		return { locale, pathWithoutLocale };
	}

	// No locale prefix, use default
	return { locale: DEFAULT_LOCALE, pathWithoutLocale: pathname };
}

/**
 * Add locale prefix to a path
 * For default locale, returns path without prefix
 * For other locales, adds locale code prefix (e.g., 'en' for 'en-US')
 */
export function addLocaleToPath(path: string, locale: Locale): string {
	if (locale === DEFAULT_LOCALE) {
		return path;
	}

	const localeCode = getLocaleCode(locale);
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	
	// Don't add prefix if it already exists
	if (cleanPath.startsWith(`/${localeCode}/`)) {
		return cleanPath;
	}

	return `/${localeCode}${cleanPath}`;
}

/**
 * Remove locale prefix from a path
 */
export function removeLocaleFromPath(path: string): string {
	const segments = path.split('/').filter(Boolean);
	
	if (segments.length === 0) {
		return '/';
	}

	const firstSegment = segments[0];
	
	// Check if first segment looks like a locale code
	if (firstSegment.length >= 2 && firstSegment.length <= 3 && /^[a-z]{2,3}$/i.test(firstSegment)) {
		return '/' + segments.slice(1).join('/') || '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}



