'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Locale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
	currentLocale: Locale;
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}

export default function LanguageSwitcher({
	currentLocale,
	supportedLocales,
	localeNames,
}: LanguageSwitcherProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLanguageChange = (newLocale: Locale) => {
		if (newLocale === currentLocale) return;

		// Get the current path without locale
		const pathWithoutLocale = removeLocaleFromPath(pathname);
		
		// Add the new locale to the path
		const newPath = addLocaleToPath(pathWithoutLocale, newLocale);
		
		// Navigate to the new path
		router.push(newPath);
	};

	// Ensure we have at least the current locale
	const locales = supportedLocales.length > 0 ? supportedLocales : [currentLocale];
	const names = Object.keys(localeNames).length > 0 ? localeNames : { [currentLocale]: 'English' };

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Change language" className="h-9 w-9">
					<Globe className="h-4 w-4" />
					<span className="sr-only">Change language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[150px]">
				{locales.length > 0 ? (
					locales.map((locale) => {
						const isActive = locale === currentLocale;
						const displayName = names[locale] || locale;
						return (
							<DropdownMenuItem
								key={locale}
								onClick={() => handleLanguageChange(locale)}
								className={isActive ? 'bg-accent' : ''}
							>
								{displayName}
								{isActive && <span className="ml-auto text-xs">✓</span>}
							</DropdownMenuItem>
						);
					})
				) : (
					<DropdownMenuItem disabled>No languages available</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}



