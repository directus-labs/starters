import '@/styles/globals.css';
import '@/styles/fonts.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';

import NavigationBar from '@/components/layout/NavigationBar';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { fetchGlobals } from '@/lib/directus/fetchers';
import { getDirectusAssetURL } from '@/lib/directus/directus-utils';

export async function generateMetadata(): Promise<Metadata> {
	const globals = await fetchGlobals();

	const siteTitle = globals?.title ?? 'Simple CMS';
	const siteDescription = globals?.description ?? 'A starter CMS template powered by Next.js and Directus.';
	const faviconURL = globals?.favicon ? getDirectusAssetURL(globals.favicon) : '/favicon.ico';

	return {
		title: siteTitle,
		description: siteDescription,
		icons: {
			icon: faviconURL,
		},
	};
}

export default async function RootLayout({ children }: { children: ReactNode }) {
	const globals = await fetchGlobals();

	const accentColor = globals?.accent_color || '#6644ff';

	return (
		<html lang="en" style={{ '--accent-color': accentColor } as React.CSSProperties} suppressHydrationWarning>
			<body className="antialiased font-sans">
				<ThemeProvider>
					<NavigationBar />
					<main className="min-h-screen px-2 md:px-8 lg:px-16">{children}</main>
					<Footer />
				</ThemeProvider>
			</body>
		</html>
	);
}
