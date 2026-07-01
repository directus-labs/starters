<script setup lang="ts">
import type { Page, PageBlock } from '#shared/types/schema';
import { withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { getPageIdForEditing, setAttr, setVisualEditingPageContext } from '~/utils/visualEditing';

const route = useRoute();
const { enabled } = useLivePreview();
const pageUrl = useRequestURL();
const { isVisualEditingEnabled, apply } = useVisualEditing();

const permalink = withoutTrailingSlash(withLeadingSlash(route.path));

// Live preview sends version=published (Directus v12+) or version=main (older Directus versions) for live content.
// Neither key requires an explicit version parameter — strip both to fetch the default published version.
const contentVersion =
	route.query.version !== 'published' && route.query.version !== 'main'
		? (route.query.version as string)
		: undefined;

const {
	data: page,
	error,
	refresh,
} = await useFetch<Page>('/api/pages/one', {
	key: `pages-${permalink}`,
	query: {
		permalink,
		preview: enabled.value ? true : undefined,
		id: route.query.id as string,
		version: contentVersion,
	},
});

if (!page.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const pageBlocks = computed(() => (page.value?.blocks as PageBlock[]) || []);
const pageRoot = ref<HTMLElement | null>(null);

watchEffect(() => {
	const id = (route.query.id as string) || page.value?.id;

	if (id) {
		setVisualEditingPageContext(id, contentVersion);
	}
});

useSeoMeta({
	title: page.value?.seo?.title || page.value?.title || '',
	description: page.value?.seo?.meta_description || '',
	ogTitle: page.value?.seo?.title || page.value?.title || '',
	ogDescription: page.value?.seo?.meta_description || '',
	ogUrl: pageUrl.toString(),
});

function applyPageVisualEditing() {
	if (!pageRoot.value) return;

	apply({
		elements: pageRoot.value,
		onSaved: async () => {
			await refresh();
		},
	});
}

function applyVisualEditingButton() {
	const editButton = pageRoot.value?.querySelector('#visual-editing-button') as HTMLElement | null;
	if (!editButton) return;

	apply({
		elements: editButton,
		customClass: 'visual-editing-button-class',
		onSaved: async () => {
			await refresh();
			await nextTick();
			applyPageVisualEditing();
		},
	});
}

watch(pageBlocks, async () => {
	if (!isVisualEditingEnabled.value) return;
	await nextTick();
	applyPageVisualEditing();
	applyVisualEditingButton();
});

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	applyVisualEditingButton();
	applyPageVisualEditing();
});
</script>

<template>
	<div ref="pageRoot" class="relative">
		<PageBuilder v-if="pageBlocks" :sections="pageBlocks" />
		<div
			v-if="isVisualEditingEnabled && page"
			class="fixed z-[60] w-full bottom-4 left-0 right-0 p-4 flex justify-center items-center gap-2"
		>
			<!-- Opens the page blocks builder — the versioned entry point for M2A content on pages. -->
			<Button
				id="visual-editing-button"
				variant="secondary"
				:data-directus="
					setAttr({
						collection: 'pages',
						item: getPageIdForEditing(),
						fields: ['blocks', 'meta_m2a_button'],
						mode: 'modal',
					})
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
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	transform: none;
	background: transparent;
}
.directus-visual-editing-overlay.visual-editing-button-class {
	opacity: 0 !important;
	z-index: 70 !important;
}
.directus-visual-editing-overlay {
	z-index: 40 !important;
}
</style>
