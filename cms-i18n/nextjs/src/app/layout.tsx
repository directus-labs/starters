import '@/styles/globals.css';
import '@/styles/fonts.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';

import VisualEditingLayout from '@/components/layout/VisualEditingLayout';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { fetchSiteData } from '@/lib/directus/fetchers';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';
import { getLocaleFromHeaders, getLanguagesFromDirectus } from '@/lib/i18n/server';
import { getLocaleCode, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

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

	const [siteData, { languages: languagesArray, directionMap }] = await Promise.all([
		fetchSiteData(locale),
		getLanguagesFromDirectus(),
	]);

	const { globals, headerNavigation, footerNavigation } = siteData;

	const allLocales = languagesArray.map((lang) => lang.code);
	if (!allLocales.includes(DEFAULT_LOCALE)) {
		allLocales.unshift(DEFAULT_LOCALE);
	}
	const supportedLocales = allLocales.length > 0 ? allLocales : [DEFAULT_LOCALE];

	const localeNames =
		languagesArray.length > 0
			? (Object.fromEntries([
					[DEFAULT_LOCALE, 'English'],
					...languagesArray.map((lang) => [lang.code, lang.name || lang.code]),
				]) as Record<Locale, string>)
			: ({ [DEFAULT_LOCALE]: 'English' } as Record<Locale, string>);

	const direction = directionMap[locale] || 'ltr';
	const accentColor = globals?.accent_color || '#6644ff';

	return (
		<html
			lang={localeCode}
			dir={direction}
			style={{ '--accent-color': accentColor } as React.CSSProperties}
			suppressHydrationWarning
		>
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
