<script setup>
import { useAsyncData } from '#app';
import { computed, watch } from 'vue';

const {
	data: siteData,
	error: siteError,
	status,
} = await useAsyncData('site-data', () => $fetch('/api/site-data').catch(() => null));

const fallbackSiteData = {
	headerNavigation: { items: [] },
	footerNavigation: { items: [] },
	globals: {
		title: 'Simple CMS',
		description: 'A starter CMS template powered by Nuxt and Directus.',
		logo: '',
		social_links: [],
		accent_color: '#6644ff',
		favicon: '',
	},
};

const finalSiteData = computed(() => siteData.value || fallbackSiteData);

const headerNavigation = computed(() => finalSiteData.value?.headerNavigation || { items: [] });
const footerNavigation = computed(() => finalSiteData.value?.footerNavigation || { items: [] });
const globals = computed(() => finalSiteData.value?.globals || fallbackSiteData.globals);

const siteTitle = computed(() => globals.value?.title || 'Simple CMS');
const siteDescription = computed(() => globals.value?.description || '');
const faviconURL = computed(() => (globals.value?.favicon ? `/assets/${globals.value.favicon}` : '/favicon.ico'));

const updateAccentColor = () => {
	if (import.meta.client) {
		document.documentElement.style.setProperty('--accent-color', globals.value.accent_color);
	}
};

watch(() => globals.value.accent_color, updateAccentColor, { immediate: true });

useHead({
	titleTemplate: (pageTitle) => (pageTitle ? `${pageTitle} | ${siteTitle.value}` : siteTitle.value),
	meta: [
		{ name: 'description', content: siteDescription },
		{ property: 'og:title', content: siteTitle },
		{ property: 'og:description', content: siteDescription },
		{ property: 'og:type', content: 'website' },
	],
	link: [{ rel: 'icon', type: 'image/x-icon', href: faviconURL }],
});
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
			<NavigationBar v-if="headerNavigation" :navigation="headerNavigation" :globals="globals" />
			<NuxtPage />
			<Footer v-if="footerNavigation" :navigation="footerNavigation" :globals="globals" />
		</div>
	</div>
</template>
