<script setup lang="ts">
import type { Page, PageBlock } from '#shared/types/schema';

const route = useRoute();
const { enabled, state } = useLivePreview();
const pageUrl = useRequestURL();
const { isVisualEditingEnabled, apply } = useVisualEditing();

const permalink = `/${((route.params.permalink as string[]) || []).join('/')}`;

const {
	data: page,
	error,
	refresh,
} = await useFetch<Page>(`/api/pages/${permalink}`, {
	key: `pages-${permalink}`,
	query: {
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

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		onSaved: () => refresh(),
	});
});
</script>

<template>
	<PageBuilder v-if="pageBlocks" :sections="pageBlocks" />
</template>
