<script setup>
const { data: siteData, error: siteError, status } = await useFetch('/api/site-data');

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

useHead({
	style: [
		{
			id: 'accent-color',
			innerHTML: `:root { --accent-color: ${unref(globals).accent_color} !important; }`,
		},
	],
	bodyAttrs: {
		class: 'antialiased font-sans',
	},
});

useSeoMeta({
	titleTemplate: `%s / ${unref(globals).title}`,
	ogSiteName: unref(globals).title,
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
