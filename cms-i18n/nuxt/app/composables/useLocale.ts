/**
 * Composable for accessing locale in Vue components.
 * SSR: uses locale set by middleware (context/header)
 * Client: derives locale from current browser path
 */
import { DEFAULT_LOCALE, getLocaleCode, codeToLocale, type Locale } from '~/lib/i18n/config';
import { addLocaleToPath, removeLocaleFromPath } from '~/lib/i18n/utils';

export function useLocale() {
	const nuxtApp = useNuxtApp();
	const route = useRoute();

	/**
	 * Gets the current locale.
	 * - On server: from middleware-set context or x-locale header
	 * - On client: prefer route params (when using locale alias), fallback to URL path
	 */
	const currentLocale = computed<Locale>(() => {
		// SSR: middleware sets event.context.locale and x-locale
		if (import.meta.server) {
			const ssrLocale = nuxtApp.ssrContext?.event?.context?.locale;
			if (ssrLocale) return ssrLocale;
			const headerLocale = nuxtApp.ssrContext?.event?.node?.req?.headers?.['x-locale'];
			if (typeof headerLocale === 'string') return headerLocale;
		}

		// Client: prefer route params (added via router alias)
		if (route.params.locale && typeof route.params.locale === 'string') {
			return codeToLocale(route.params.locale.toLowerCase());
		}

		// Fallback: derive from browser path
		// Use fullPath to include locale prefix if present
		const path = route.fullPath.split('?')[0] || route.path;
		const first = path.split('/').filter(Boolean)[0];
		if (first && /^[a-z]{2,3}$/i.test(first)) {
			return codeToLocale(first.toLowerCase());
		}
		return DEFAULT_LOCALE;
	});

	/**
	 * Gets the current locale code for display.
	 */
	const currentLocaleCode = computed<string>(() => getLocaleCode(currentLocale.value));

	/**
	 * Checks if the current locale is the default locale.
	 */
	const isDefaultLocale = computed<boolean>(() => currentLocale.value === DEFAULT_LOCALE);

	/**
	 * Gets the path without locale prefix.
	 */
	const pathWithoutLocale = computed<string>(() => removeLocaleFromPath(route.fullPath.split('?')[0] || route.path));

	/**
	 * Generates a path with the specified locale.
	 */
	function localizedPath(path: string, locale: Locale): string {
		return addLocaleToPath(path, locale);
	}

	return {
		currentLocale,
		currentLocaleCode,
		isDefaultLocale,
		pathWithoutLocale,
		localizedPath,
		DEFAULT_LOCALE,
	};
}
