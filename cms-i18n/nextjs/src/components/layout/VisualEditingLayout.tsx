'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { useVisualEditing } from '@/hooks/useVisualEditing';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/layout/NavigationBar';
import Footer from '@/components/layout/Footer';

import { Locale } from '@/lib/i18n/config';

interface VisualEditingLayoutProps {
	headerNavigation: any;
	footerNavigation: any;
	globals: any;
	children: ReactNode;
	currentLocale: Locale;
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}

export default function VisualEditingLayout({
	headerNavigation,
	footerNavigation,
	globals,
	children,
	currentLocale,
	supportedLocales,
	localeNames,
}: VisualEditingLayoutProps) {
	const navRef = useRef<HTMLElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const { isVisualEditingEnabled, apply } = useVisualEditing();
	const router = useRouter();

	useEffect(() => {
		if (isVisualEditingEnabled) {
			// Apply visual editing for the navigation bar if its ref is set.
			if (navRef.current) {
				apply({
					elements: [navRef.current],
					onSaved: () => router.refresh(),
				});
			}
			// Apply visual editing for the footer if its ref is set.
			if (footerRef.current) {
				apply({
					elements: [footerRef.current],
					onSaved: () => router.refresh(),
				});
			}
		}
	}, [isVisualEditingEnabled, apply, router]);

	return (
		<>
			<NavigationBar
				ref={navRef}
				navigation={headerNavigation}
				globals={globals}
				currentLocale={currentLocale}
				supportedLocales={supportedLocales}
				localeNames={localeNames}
			/>
			{children}
			<Footer ref={footerRef} navigation={footerNavigation} globals={globals} />
		</>
	);
}
