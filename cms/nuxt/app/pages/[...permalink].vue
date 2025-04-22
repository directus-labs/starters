<script setup lang="ts">
import type { Page, PageBlock } from '#shared/types/schema';
import { withLeadingSlash, withoutTrailingSlash } from 'ufo';

const route = useRoute();
const { enabled, state } = useLivePreview();
const pageUrl = useRequestURL();
const { isVisualEditingEnabled, apply, setAttr } = useVisualEditing();

const permalink = withoutTrailingSlash(withLeadingSlash(route.path));

const {
	data: page,
	error,
	refresh,
} = await useFetch<Page>('/api/pages/one', {
	key: `pages-${permalink}`,
	query: {
		permalink,
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
	},
});

if (!page.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const pageBlocks = computed(() => (page.value?.blocks as PageBlock[]) || []);

useSeoMeta({
	title: page.value?.seo?.title || page.value?.title || '',
	description: page.value?.seo?.meta_description || '',
	ogTitle: page.value?.seo?.title || page.value?.title || '',
	ogDescription: page.value?.seo?.meta_description || '',
	ogUrl: pageUrl.toString(),
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
			// This makes sure the visual editor elements are updated after the page is refreshed. In case you've added new blocks to the page.
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
	<div class="relative">
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
