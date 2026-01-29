import { type Locale, DEFAULT_LOCALE, getLocaleCode, codeToLocale } from './config';

/**
 * Extracts locale from URL path. Default locale has no prefix.
 */
export function getLocaleFromPath(pathname: string): { locale: Locale; pathWithoutLocale: string } {
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	if (!firstSegment) {
		return { locale: DEFAULT_LOCALE, pathWithoutLocale: '/' };
	}

	const lowerSegment = firstSegment.toLowerCase();

	if (lowerSegment.length >= 2 && lowerSegment.length <= 3 && /^[a-z]{2,3}$/.test(lowerSegment)) {
		const locale = codeToLocale(lowerSegment);
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
	const firstSegment = segments[0];

	if (!firstSegment) {
		return '/';
	}

	const lowerSegment = firstSegment.toLowerCase();

	if (lowerSegment.length >= 2 && lowerSegment.length <= 3 && /^[a-z]{2,3}$/.test(lowerSegment)) {
		return '/' + segments.slice(1).join('/') || '/';
	}

	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Checks if a URL is external (http://, https://, or protocol-relative //).
 */
export function isExternalUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

/**
 * Localizes a link path. Returns external URLs unchanged, adds locale prefix to internal paths.
 */
export function localizeLink(path: string | null | undefined, locale: Locale): string | undefined {
	if (!path) {
		if (import.meta.dev) {
			// eslint-disable-next-line no-console
			console.warn('[localizeLink] Received null or undefined path for locale:', locale);
		}

		return undefined;
	}

	if (isExternalUrl(path)) return path;
	return addLocaleToPath(path, locale);
}

/**
 * Returns a localized 404 error message based on the current locale.
 */
export function getNotFoundMessage(locale: Locale, type: 'page' | 'post' = 'page'): string {
	const messages: Record<string, { page: string; post: string }> = {
		'en-US': { page: '404 - Page Not Found', post: '404 - Post Not Found' },
		'es-ES': { page: '404 - Página No Encontrada', post: '404 - Publicación No Encontrada' },
		'fr-FR': { page: '404 - Page Non Trouvée', post: '404 - Article Non Trouvé' },
		'de-DE': { page: '404 - Seite Nicht Gefunden', post: '404 - Beitrag Nicht Gefunden' },
		'it-IT': { page: '404 - Pagina Non Trovata', post: '404 - Articolo Non Trovato' },
		'pt-BR': { page: '404 - Página Não Encontrada', post: '404 - Publicação Não Encontrada' },
		'ru-RU': { page: '404 - Страница Не Найдена', post: '404 - Запись Не Найдена' },
		'ar-SA': { page: '404 - الصفحة غير موجودة', post: '404 - المنشور غير موجود' },
	};

	return messages[locale]?.[type] || messages['en-US'][type];
}
