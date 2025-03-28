<script setup lang="ts">
const {
	data: siteData,
	error: siteError,
	refresh,
} = await useFetch('/api/site-data', {
	key: 'site-data',
});

const { isVisualEditingEnabled, apply } = useVisualEditing();

const navigation = useTemplateRef('navigationRef');
const footer = useTemplateRef('footerRef');

if (siteError.value) {
	throw createError({
		statusCode: 500,
		statusMessage: 'Failed to load site data. Please try again later.',
		fatal: true,
	});
}

useHead({
	style: [
		{
			id: 'accent-color',
			innerHTML: `:root { --accent-color: ${unref(siteData)?.globals.accent_color || '#6644ff'} !important; }`,
		},
	],
	bodyAttrs: {
		class: 'antialiased font-sans',
	},
});

useSeoMeta({
	titleTemplate: `%s / ${unref(siteData)?.globals.title}`,
	ogSiteName: unref(siteData)?.globals.title,
});

onMounted(() => {
	if (!isVisualEditingEnabled.value) return;
	apply({
		elements: [navigation.value?.navigationRef as HTMLElement, footer.value?.footerRef as HTMLElement],
		onSaved: () => {
			refresh();
		},
	});
});
</script>

<template>
	<div>
		<NavigationBar
			v-if="siteData?.headerNavigation"
			ref="navigationRef"
			:navigation="siteData.headerNavigation"
			:globals="siteData.globals"
		/>
		<NuxtPage />
		<Footer
			v-if="siteData?.footerNavigation"
			ref="footerRef"
			:navigation="siteData.footerNavigation"
			:globals="siteData.globals"
		/>
	</div>
</template>
