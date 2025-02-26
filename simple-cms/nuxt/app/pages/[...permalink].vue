<script setup>
import { useAsyncData, useRoute, usePreviewMode } from '#app';
import PageBuilder from '~/components/PageBuilder.vue';
import AdminBar from '~/components/shared/AdminBar.vue';

const route = useRoute();
const permalink = `/${(route.params.permalink || []).join('/')}`;

const { enabled } = usePreviewMode();

const { data: pageData, error: pageError } = await useAsyncData(`page-data-${permalink}`, () =>
	$fetch(`/api/page-data?permalink=${encodeURIComponent(permalink)}`),
);

if (!pageData.value && !pageError) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found' });
}

watchEffect(() => {
	if (pageData.value) {
		useHead({
			title: pageData.value?.seo?.title || pageData.value?.title || '',
			meta: [
				{ name: 'description', content: pageData.value?.seo?.meta_description || '' },
				{ property: 'og:title', content: pageData.value?.seo?.title || pageData.value?.title || '' },
				{ property: 'og:description', content: pageData.value?.seo?.meta_description || '' },
				{ property: 'og:url', content: `${import.meta.env.VITE_SITE_URL}${permalink}` },
			],
		});
	}
});
</script>

<template>
	<div>
		<AdminBar v-if="enabled" :content="pageData" type="page" />

		<div v-if="pageError">404 - Page Not Found</div>
		<div v-else>
			<PageBuilder :sections="pageData.blocks" />
		</div>
	</div>
</template>
