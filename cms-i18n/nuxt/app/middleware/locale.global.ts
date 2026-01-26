/**
 * Global middleware to extract locale from URL and set headers.
 * Similar to Next.js middleware but using Nuxt middleware pattern.
 */
import { getLocaleFromPath } from '~/lib/i18n/utils';

export default defineNuxtRouteMiddleware((to) => {
	// Skip static assets and API routes
	const path = to.path;

	if (
		path.startsWith('/_nuxt') ||
		path.startsWith('/api') ||
		path.startsWith('/favicon.ico') ||
		path.startsWith('/images') ||
		path.startsWith('/icons') ||
		path.startsWith('/fonts') ||
		path.match(/\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/)
	) {
		return;
	}

	// Extract locale from path
	const { locale, pathWithoutLocale } = getLocaleFromPath(path);

	// Store locale in route meta for access in components
	to.meta.locale = locale;
	to.meta.pathWithoutLocale = pathWithoutLocale;

	// For SSR, we need to set a header that server API routes can read
	// This is done via useState which persists across the request
	if (import.meta.server) {
		useState('locale', () => locale);
	}
});
