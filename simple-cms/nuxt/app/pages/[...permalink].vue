<script setup lang="ts">
import type { Page, PageBlock } from '#shared/types/schema';

const route = useRoute();
const { enabled, state } = useLivePreview();
const pageUrl = useRequestURL();

const permalink = `/${((route.params.permalink as string[]) || []).join('/')}`;

const { data: page, error } = await useFetch<Page>(`/api/pages/${permalink}`, {
	key: `pages-${permalink}`,
	query: {
		preview: enabled.value ? true : undefined,
		token: enabled.value ? state.token : undefined,
	},
});

const { setAdminBarState, isAdminBarEnabled } = useAdminBar();

if (!page.value || error.value) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const pageBlocks = computed(() => (page.value?.blocks as PageBlock[]) || []);

// Update Admin Bar with page details - totally safe to remove this if you don't plan on using the admin bar
if (isAdminBarEnabled) {
	setAdminBarState({
		collection: 'pages',
		item: page.value as Page,
		title: page.value?.seo?.title || page.value?.title || '',
	});
}

useSeoMeta({
	title: page.value?.seo?.title || page.value?.title || '',
	description: page.value?.seo?.meta_description || '',
	ogTitle: page.value?.seo?.title || page.value?.title || '',
	ogDescription: page.value?.seo?.meta_description || '',
	ogUrl: pageUrl.toString(),
});
</script>

<template>
	<PageBuilder v-if="pageBlocks" :sections="pageBlocks" />
</template>
