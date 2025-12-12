import 'server-only';
import { headers } from 'next/headers';
import { Locale, DEFAULT_LOCALE } from './config';

/**
 * Get the current locale from request headers (set by middleware)
 */
export async function getLocaleFromHeaders(): Promise<Locale> {
	const headersList = await headers();
	const localeHeader = headersList.get('x-locale');
	
	return localeHeader || DEFAULT_LOCALE;
}



