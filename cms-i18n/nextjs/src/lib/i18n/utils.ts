import { Locale, DEFAULT_LOCALE, getLocaleCode, codeToLocale } from './config';

/**
 * Extracts locale from URL path. Default locale has no prefix.
 */
export function getLocaleFromPath(pathname: string): { locale: Locale; pathWithoutLocale: string } {
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length === 0) {
		return { locale: DEFAULT_LOCALE, pathWithoutLocale: '/' };
	}

	const firstSegment = segments[0];

	if (firstSegment.length >= 2 && firstSegment.length <= 3 && /^[a-z]{2,3}$/i.test(firstSegment)) {
		const locale = codeToLocale(firstSegment.toLowerCase());
		const pathWithoutLocale = '/' + segments.slice(1).join('/') || '/';

		return { locale, pathWithoutLocale };
	}

	return { locale: DEFAULT_LOCALE, pathWithoutLocale: pathname };
}

/**
 * Adds locale prefix to path. Default locale returns path unchanged.
 */
export function addLocaleToPath(path: string, locale: Locale): string {
	if (locale === DEFAULT_LOCALE) {
		return path;
	}

	const localeCode = getLocaleCode(locale);
	const cleanPath = path.startsWith('/') ? path : `/${path}`;

	if (cleanPath.startsWith(`/${localeCode}/`)) {
		return cleanPath;
	}

	return `/${localeCode}${cleanPath}`;
}

/**
 * Removes locale prefix from path.
 */
export function removeLocaleFromPath(path: string): string {
	const segments = path.split('/').filter(Boolean);

	if (segments.length === 0) {
		return '/';
	}

	const firstSegment = segments[0];

	if (firstSegment.length >= 2 && firstSegment.length <= 3 && /^[a-z]{2,3}$/i.test(firstSegment)) {
		return '/' + segments.slice(1).join('/') || '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}
