<script setup lang="ts">
import type { Page, PageBlock } from '#shared/types/schema';
import { withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { addLocaleToPath } from '~/lib/i18n/utils';
import { DEFAULT_LOCALE } from '~/lib/i18n/config';

const route = useRoute();
const { enabled, state } = useLivePreview();
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();
const runtimeConfig = useRuntimeConfig();

// Get locale from composable (handles SSR URL rewrite correctly)
const { currentLocale, pathWithoutLocale: pathNoLocale } = useLocale();
const locale = currentLocale.value;

// Use the path without locale for the permalink
const permalink = withoutTrailingSlash(withLeadingSlash(pathNoLocale.value));

// Handle Live Preview adding version=main which is not required when fetching the main version.
const version = route.query.version === 'main' ? undefined : (route.query.version as string);

const {
	public: { siteUrl },
} = runtimeConfig;

// Fetch page data
const {
	data: page,
	error: pageError,
	refresh,
} = await useFetch<Page>('/api/pages/one', {
	key: `pages-${permalink}-${locale}`,
	headers: {
		'x-locale': locale,
	},
	query: {
		permalink,
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
		id: route.query.id as string,
		version,
		locale,
	},
});

// Handle 404
if (!page.value || pageError.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

// Page-related computed properties
const pageBlocks = computed(() => (page.value?.blocks as PageBlock[]) || []);

// Reuse site data (locales) from layout to avoid refetching
const siteDataState = useState<any>('site-data');
const supportedLocales = computed(() => siteDataState.value?.supportedLocales || [DEFAULT_LOCALE]);

// Build alternate language URLs
const localizedPath = addLocaleToPath(permalink, locale);
const fullUrl = `${siteUrl}${localizedPath}`;

// Build alternates for all supported locales
const alternateLanguages = computed(() => {
	const alternates: Record<string, string> = {};
	for (const altLocale of supportedLocales.value) {
		const altPath = addLocaleToPath(permalink, altLocale);
		alternates[altLocale] = `${siteUrl}${altPath}`;
	}
	return alternates;
});

// SEO meta for pages
useSeoMeta({
	title: page.value?.seo?.title || page.value?.title || '',
	description: page.value?.seo?.meta_description || '',
	ogTitle: page.value?.seo?.title || page.value?.title || '',
	ogDescription: page.value?.seo?.meta_description || '',
	ogUrl: fullUrl,
	ogLocale: locale,
});

// Set alternate language links via useHead
useHead({
	link: Object.entries(alternateLanguages.value).map(([lang, href]) => ({
		rel: 'alternate',
		hreflang: lang,
		href,
	})),
});

// Helper functions for Visual Editing
function applyVisualEditing() {
	apply({
		onSaved: async () => {
			await refresh();
		},
	});
}

function applyVisualEditingButton() {
	apply({
		elements: document.querySelector('#visual-editing-button') as HTMLElement,
		customClass: 'visual-editing-button-class',
		onSaved: async () => {
			await refresh();
			await nextTick();
			applyVisualEditing();
		},
	});
}

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	applyVisualEditingButton();
	applyVisualEditing();
});
</script>

<template>
	<div v-if="page" class="relative">
		<PageBuilder v-if="pageBlocks" :sections="pageBlocks" />
		<div
			v-if="isVisualEditingEnabled && page"
			class="fixed z-50 w-full bottom-4 left-0 right-0 p-4 flex justify-center items-center gap-2"
		>
			<!-- If you're not using the visual editor it's safe to remove this element. Just a helper to let editors add edit / add new blocks to a page. -->
			<Button
				id="visual-editing-button"
				variant="secondary"
				:data-directus="
					setAttr({ collection: 'pages', item: page.id, fields: ['blocks', 'meta_m2a_button'], mode: 'modal' })
				"
			>
				<Icon name="lucide:pencil" />
				Edit All Blocks
			</Button>
		</div>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Page Not Found</div>
</template>

<style>
.directus-visual-editing-overlay.visual-editing-button-class .directus-visual-editing-edit-button {
	/* Not using style scoped because the visual editor adds it's own elements to the page. Safe to remove this if you're not using the visual editor. */
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	transform: none;
	background: transparent;
}
</style>
