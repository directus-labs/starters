<script setup lang="ts">
import { Globe, Check } from 'lucide-vue-next';
import { type Locale, DEFAULT_LOCALE, getLocaleCode } from '~/lib/i18n/config';
import { addLocaleToPath, removeLocaleFromPath } from '~/lib/i18n/utils';

interface LanguageSwitcherProps {
	currentLocale: Locale;
	supportedLocales: Locale[];
	localeNames: Record<Locale, string>;
}

const props = defineProps<LanguageSwitcherProps>();

const route = useRoute();

async function handleLanguageChange(newLocale: Locale) {
	if (newLocale === props.currentLocale) return;

	const pathWithoutLocale = removeLocaleFromPath(route.path);
	const newPath = addLocaleToPath(pathWithoutLocale, newLocale);

	// Use hard navigation to ensure all data (header/footer) is refreshed
	// This is necessary because the layout data needs to be re-fetched for the new locale
	await navigateTo(newPath, { external: true });
}

// Build ordered list with default locale first
const allLocales = computed(() => {
	const locales = [DEFAULT_LOCALE, ...props.supportedLocales.filter((locale) => locale !== DEFAULT_LOCALE)];
	return locales.length > 0 ? locales : [props.currentLocale];
});

// Build names map with fallback
const names = computed<Record<string, string>>(() => {
	if (Object.keys(props.localeNames).length > 0) {
		return { [DEFAULT_LOCALE]: 'English', ...props.localeNames };
	}

	// When no localeNames are provided, generate fallback names for all locales
	const fallbackNames: Record<string, string> = {};

	for (const locale of allLocales.value) {
		fallbackNames[locale] = getLocaleCode(locale);
	}

	return fallbackNames;
});
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="ghost" size="icon" aria-label="Change language" class="h-9 w-9">
				<Globe class="h-4 w-4" />
				<span class="sr-only">Change language</span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" class="w-auto min-w-fit">
			<template v-if="allLocales.length > 0">
				<DropdownMenuItem
					v-for="locale in allLocales"
					:key="locale"
					:class="[
						'font-heading text-nav cursor-pointer',
						locale === currentLocale ? 'text-accent' : 'hover:text-accent',
						'hover:bg-transparent focus:bg-transparent',
						'px-3 py-1.5',
					]"
					@click="handleLanguageChange(locale)"
				>
					<span class="whitespace-nowrap">{{ names[locale] || locale }}</span>
					<Check v-if="locale === currentLocale" class="ml-2 size-4 shrink-0" />
				</DropdownMenuItem>
			</template>
			<DropdownMenuItem v-else disabled>No languages available</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
