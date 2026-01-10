<script setup lang="ts">
import type { SiteData } from '#shared/types/site-data';

// Get locale from composable
const { currentLocale, currentLocaleCode } = useLocale();
const locale = currentLocale.value;
const localeCode = currentLocaleCode.value;

const {
	data: siteData,
	error: siteError,
	refresh,
} = await useFetch<SiteData>('/api/site-data', {
	key: `site-data-${locale}`,
	headers: {
		'x-locale': locale,
	},
	query: {
		locale,
	},
});

// Persist site data for reuse (locales, globals, navigation)
const siteDataState = useState<SiteData | null>('site-data', () => siteData.value ?? null);

if (!siteDataState.value && siteData.value) {
	siteDataState.value = siteData.value;
}

const effectiveSiteData = computed(() => siteDataState.value ?? siteData.value ?? null);

const { isVisualEditingEnabled, apply } = useVisualEditing();

const navigation = useTemplateRef('navigationRef');
const footer = useTemplateRef('footerRef');

if (siteError.value) {
	throw createError({
		statusCode: 500,
		statusMessage: 'Failed to load site data. Please try again later.',
		fatal: true,
	});
}

// Set HTML lang and dir attributes based on locale
useHead({
	htmlAttrs: {
		lang: localeCode,
		dir: effectiveSiteData.value?.direction || 'ltr',
	},
	style: [
		{
			id: 'accent-color',
			innerHTML: `:root { --accent-color: ${effectiveSiteData.value?.globals?.accent_color || '#6644ff'} !important; }`,
		},
	],
	bodyAttrs: {
		class: 'antialiased font-sans',
	},
});

useSeoMeta({
	titleTemplate: `%s / ${effectiveSiteData.value?.globals?.title || ''}`,
	ogSiteName: effectiveSiteData.value?.globals?.title,
});

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		elements: [navigation.value?.navigationRef as HTMLElement, footer.value?.footerRef as HTMLElement],
		onSaved: () => {
			refresh();
		},
	});
});
</script>

<template>
	<div>
		<NavigationBar
			v-if="effectiveSiteData?.headerNavigation"
			ref="navigationRef"
			:navigation="effectiveSiteData.headerNavigation"
			:globals="effectiveSiteData.globals"
			:locale="effectiveSiteData.locale"
			:supported-locales="effectiveSiteData.supportedLocales"
			:locale-names="effectiveSiteData.localeNames"
		/>
		<NuxtPage />
		<Footer
			v-if="effectiveSiteData?.footerNavigation"
			ref="footerRef"
			:navigation="effectiveSiteData.footerNavigation"
			:globals="effectiveSiteData.globals"
			:locale="effectiveSiteData.locale"
		/>
	</div>
</template>
