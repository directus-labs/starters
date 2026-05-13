'use client';

import { usePathname } from 'next/navigation';
import { Locale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
	currentLocale: Locale;
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}

export default function LanguageSwitcher({ currentLocale, supportedLocales, localeNames }: LanguageSwitcherProps) {
	const pathname = usePathname();

	const handleLanguageChange = (newLocale: Locale) => {
		if (newLocale === currentLocale) return;

		const pathWithoutLocale = removeLocaleFromPath(pathname);
		const newPath = addLocaleToPath(pathWithoutLocale, newLocale);

		window.location.href = newPath;
	};

	const allLocales = [DEFAULT_LOCALE, ...supportedLocales.filter((locale) => locale !== DEFAULT_LOCALE)];
	const locales = allLocales.length > 0 ? allLocales : [currentLocale];
	const names: Record<Locale, string> =
		Object.keys(localeNames).length > 0 ? localeNames : ({} as Record<Locale, string>);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Change language" className="size-9">
					<Globe className="size-4" />
					<span className="sr-only">Change language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-auto min-w-fit">
				{locales.length > 0 ? (
					locales.map((locale) => {
						const isActive = locale === currentLocale;
						const displayName = names[locale] || locale;

						return (
							<DropdownMenuItem
								key={locale}
								onClick={() => handleLanguageChange(locale)}
								className={cn(isActive ? 'text-accent' : 'hover:text-accent cursor-pointer', 'px-3 py-1.5')}
							>
								<span className="whitespace-nowrap">{displayName}</span>
								{isActive && <Check className="ml-2 size-4 shrink-0" />}
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
