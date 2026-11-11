import { Locale, DEFAULT_LOCALE, getLocaleCode } from './config';

/**
 * Splits a leading locale code off a path, e.g. "/es/blog/post" -> es-ES + "/blog/post".
 *
 * Only codes in `localeMap` (short code -> locale, built from the Directus languages collection with
 * buildLocaleMap) count as locales. Guessing from the segment's shape would misread pages with short
 * slugs like "/faq" and routes like "/api" as locales.
 */
export function getLocaleFromPath(
	pathname: string,
	localeMap: Record<string, Locale>,
): { locale: Locale; pathWithoutLocale: string } {
	const segments = pathname.split('/').filter(Boolean);
	const locale = segments[0] ? localeMap[segments[0].toLowerCase()] : undefined;

	if (!locale) {
		return { locale: DEFAULT_LOCALE, pathWithoutLocale: pathname || '/' };
	}

	return { locale, pathWithoutLocale: '/' + segments.slice(1).join('/') };
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
 * Removes a leading locale code from a path. See getLocaleFromPath for which codes count.
 */
export function removeLocaleFromPath(path: string, localeMap: Record<string, Locale>): string {
	return getLocaleFromPath(path.startsWith('/') ? path : `/${path}`, localeMap).pathWithoutLocale;
}

/**
 * Resolves permalink from Next.js params array.
 * Converts array of segments to a clean path string.
 */
export function resolvePermalink(permalink?: string[]): string {
	const permalinkSegments = permalink || [];

	return `/${permalinkSegments.join('/')}`.replace(/\/$/, '') || '/';
}
