/**
 * Server middleware to extract locale from URL, set it in context/headers,
 * and rewrite locale-prefixed URLs so Nuxt routes match (like Next.js middleware).
 */
import { getLocaleFromPath } from '~/lib/i18n/utils';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';

export default defineEventHandler((event) => {
	const url = getRequestURL(event);
	const pathname = url.pathname;

	// Skip API routes, static assets, and special paths
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_nuxt') ||
		pathname.startsWith('/.well-known') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.startsWith('/images') ||
		pathname.startsWith('/icons') ||
		pathname.startsWith('/fonts') ||
		pathname.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot|js|css|json)$/)
	) {
		return;
	}

	// Extract locale and path without locale prefix
	const { locale, pathWithoutLocale } = getLocaleFromPath(pathname);

	// Set locale in context and headers
	event.context.locale = locale;
	event.node.req.headers['x-locale'] = locale;
	event.node.req.headers['x-original-pathname'] = pathname;

	// Rewrite URL to strip locale prefix so file-based routing matches
	if (locale !== DEFAULT_LOCALE && pathname !== pathWithoutLocale) {
		const newUrl = pathWithoutLocale + url.search;
		event.node.req.url = newUrl;
	}
});
