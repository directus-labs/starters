import '@/styles/globals.css';
import '@/styles/fonts.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';

import VisualEditingLayout from '@/components/layout/VisualEditingLayout';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { getLocaleFromHeaders } from '@/lib/i18n/server';
import { getLocaleCode } from '@/lib/i18n/config';
import { useDirectus } from '@/lib/directus/directus';
import { readItems } from '@directus/sdk';
import type { Language } from '@/types/directus-schema';

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocaleFromHeaders();
	const { globals } = await fetchSiteData(locale);

	const siteTitle = globals?.title || 'Simple CMS';
	const siteDescription = globals?.description || 'A starter CMS template powered by Next.js and Directus.';
	const faviconURL = globals?.favicon ? getDirectusAssetURL(globals.favicon) : '/favicon.ico';

	return {
		title: {
			default: siteTitle,
			template: `%s | ${siteTitle}`,
		},
		description: siteDescription,
		icons: {
			icon: faviconURL,
		},
	};
}

export default async function RootLayout({ children }: { children: ReactNode }) {
	const locale = await getLocaleFromHeaders();
	const localeCode = getLocaleCode(locale);
	const { directus } = useDirectus();
	
	// Fetch languages from Directus for language switcher
	const [siteData, languages] = await Promise.all([
		fetchSiteData(locale),
		directus
			.request(
				readItems('languages', {
					fields: ['code', 'name'],
					sort: ['code'],
				}),
			)
			.catch((error) => {
				console.error('Error fetching languages from Directus:', error);
				// Return default language as fallback
				return [{ code: 'en-US', name: 'English' }] as Language[];
			}),
	]);

	const { globals, headerNavigation, footerNavigation } = siteData;
	const languagesArray = (languages as Language[]) || [];
	
	// Debug: Log languages to help troubleshoot
	if (languagesArray.length === 0) {
		console.warn('No languages fetched from Directus. Check permissions for the "languages" collection.');
	}
	
	// Ensure we have at least the default locale
	const supportedLocales =
		languagesArray.length > 0
			? languagesArray.map((lang) => lang.code)
			: ['en-US'];
	
	const localeNames =
		languagesArray.length > 0
			? (Object.fromEntries(
					languagesArray.map((lang) => [lang.code, lang.name || lang.code]),
				) as Record<Locale, string>)
			: ({ 'en-US': 'English' } as Record<Locale, string>);
	const accentColor = globals?.accent_color || '#6644ff';

	return (
		<html lang={localeCode} style={{ '--accent-color': accentColor } as React.CSSProperties} suppressHydrationWarning>
			<body className="antialiased font-sans flex flex-col min-h-screen">
				<ThemeProvider>
					<VisualEditingLayout
						headerNavigation={headerNavigation}
						footerNavigation={footerNavigation}
						globals={globals}
						locale={locale}
						supportedLocales={supportedLocales}
						localeNames={localeNames}
					>
						<main className="flex-grow">{children}</main>
					</VisualEditingLayout>
				</ThemeProvider>
			</body>
		</html>
	);
}
