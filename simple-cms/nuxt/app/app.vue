<script setup lang="ts">
import { useFetch } from '#app';

useHead({
	meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
	link: [{ rel: 'icon', href: '/favicon.ico' }],
	htmlAttrs: { lang: 'en' },
});

const { data: siteData, error } = useFetch('/api/site-data');

if (error.value) {
	throw createError({
		statusCode: 500,
		statusMessage: 'Failed to fetch site data',
	});
}

useSeoMeta({
	titleTemplate: '%s / Site Title',
	description: 'Site Description',
	ogSiteName: 'Site Title',
});

useSchemaOrg([
	defineOrganization({
		'@id': 'https://site.com/#organization',
		name: 'Site Title',
		logo: '/favicon.ico',
		sameAs: ['https://x.com/site', 'https://www.youtube.com/@site', 'https://www.linkedin.com/company/site'],
	}),
]);
</script>

<template>
	<div>
		<NuxtLayout :site-data="siteData" />
	</div>
</template>
