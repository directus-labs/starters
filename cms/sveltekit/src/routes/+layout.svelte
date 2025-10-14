<script lang="ts">
	import '../globals.css';
	import '../fonts.css';
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { page } from '$app/state';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { enableVisualEditing } from '$lib/directus/visualEditing';
	import { apply } from '@directus/visual-editing';
	import { getSiteData } from '$lib/directus/fetchers.remote';

	let { children } = $props();

	let siteData = $derived(await getSiteData());

	$inspect('siteData', siteData);

	const siteTitle = $derived(siteData.globals?.title || 'Simple CMS');
	const siteDescription = $derived(
		siteData.globals?.description || 'A starter CMS template powered by Svelte and Directus.'
	);
	const faviconURL = $derived(
		siteData.globals?.favicon ? getDirectusAssetURL(siteData.globals.favicon) : '/favicon.ico'
	);
	const accentColor = $derived(siteData.globals?.accent_color || '#6644ff');

	enableVisualEditing();

	afterNavigate(async (_navigation) => {
		apply({
			directusUrl: PUBLIC_DIRECTUS_URL,
			onSaved: async () => {
				await invalidateAll();
			}
		});
	});
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<link rel="icon" href={faviconURL} />
	{@html `<style>:root{ --accent-color: ${accentColor} !important }</style>`}
</svelte:head>

<!-- <svelte:boundary> -->
<ModeWatcher />
<NavigationBar />
<main class="flex-grow">{@render children()}</main>
<Footer />

<!-- </svelte:boundary> -->
