'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, getLocaleCode, type Locale } from '@/lib/i18n/config';

/**
 * Shares the locale map (short URL code -> locale, from Directus languages) with client components,
 * so they read the locale from the URL the same way the middleware does.
 */
const LocaleMapContext = createContext<Record<string, Locale>>({ [getLocaleCode(DEFAULT_LOCALE)]: DEFAULT_LOCALE });

export function LocaleMapProvider({ localeMap, children }: { localeMap: Record<string, Locale>; children: ReactNode }) {
	return <LocaleMapContext.Provider value={localeMap}>{children}</LocaleMapContext.Provider>;
}

export function useLocaleMap(): Record<string, Locale> {
	return useContext(LocaleMapContext);
}
