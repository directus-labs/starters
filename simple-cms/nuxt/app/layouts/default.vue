<script setup>
import { useAsyncData } from '#app';
import { unref } from 'vue';

const { data: siteData, error: siteError, status } = await useAsyncData('site-data', () => $fetch('/api/site-data'));

const unwrappedSiteData = unref(siteData);

const fallbackSiteData = {
	headerNavigation: { items: [] },
	footerNavigation: { items: [] },
	globals: {
		logo: '',
		description: '',
		social_links: [],
	},
};

const finalSiteData = unwrappedSiteData || fallbackSiteData;
</script>

<template>
	<div>
		<div v-if="siteError">
			<p>Failed to load site data. Please try again later.</p>
		</div>

		<div v-else-if="status === 'pending'">
			<p>Loading...</p>
		</div>

		<div v-else>
			<NavigationBar :navigation="finalSiteData.headerNavigation" :globals="finalSiteData.globals" />
			<NuxtPage />
			<Footer :navigation="finalSiteData.footerNavigation" :globals="finalSiteData.globals" />
		</div>
	</div>
</template>
