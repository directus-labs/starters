<script setup lang="ts">
import type { Page } from '#shared/types/schema';

const route = useRoute();
const config = useRuntimeConfig();

const permalink = `/${(route.params.permalink || []).join('/')}`;

const { enabled } = usePreviewMode();

const { data: pageData, error: pageError } = await useFetch(`/api/pages/${permalink}`, {});

const { setAdminBarState, isAdminBarEnabled } = useAdminBar();

if (!pageData.value && !pageError) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found' });
}

if (isAdminBarEnabled) {
	setAdminBarState({
		collection: 'pages',
		item: pageData.value,
		title: pageData.value?.seo?.title || pageData.value?.title || '',
	});
}

useSeoMeta({
	title: pageData.value?.seo?.title || pageData.value?.title || '',
	description: pageData.value?.seo?.meta_description || '',
	ogTitle: pageData.value?.seo?.title || pageData.value?.title || '',
	ogDescription: pageData.value?.seo?.meta_description || '',
	ogUrl: `${import.meta.env.VITE_SITE_URL}${permalink}`,
});
</script>

<template>
	<div>
		<div v-if="pageError">404 - Page Not Found</div>
		<div v-else>
			<PageBuilder :sections="pageData.blocks" />
		</div>
	</div>
</template>
