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
		accent_color: '#6644ff',
	},
};
const finalSiteData = unwrappedSiteData || fallbackSiteData;

const updateAccentColor = () => {
	if (import.meta.client) {
		document.documentElement.style.setProperty('--accent-color', finalSiteData.globals.accent_color || '#6644ff');
	}
};

watch(() => finalSiteData.globals.accent_color, updateAccentColor, { immediate: true });
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
