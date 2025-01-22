<script setup>
import { useAsyncData, useRoute } from '#app';
import PageBuilder from '~/components/PageBuilder.vue';

const { params } = useRoute();
const permalink = `/${(params.permalink || []).join('/')}`;

const {
	data: pageData,
	error: pageError,
	status,
} = await useAsyncData('page-data', () => $fetch(`/api/page-data?permalink=${encodeURIComponent(permalink)}`));

if (!pageData.value && !pageError) {
	throw createError({ statusCode: 404, statusMessage: 'Page not found' });
}
</script>

<template>
	<div>
		<div v-if="status === 'pending'">Loading...</div>

		<div v-else-if="pageError">404 - Page Not Found</div>

		<div v-else>
			<PageBuilder :sections="pageData.blocks" />
		</div>
	</div>
</template>
