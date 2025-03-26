<script lang="ts">
	import '../globals.css';
	import '../fonts.css';
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	const siteTitle = $derived(data.globals?.title || 'Simple CMS');
	const siteDescription = $derived(
		page.data.globals?.description || 'A starter CMS template powered by Svelte and Directus.'
	);
	const faviconURL = $derived(
		data.globals?.favicon ? getDirectusAssetURL(data.globals.favicon) : '/favicon.ico'
	);

	const accentColor = $derived(data.globals?.accent_color || '#6644ff');
</script>

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<link rel="icon" href={faviconURL} />
</svelte:head>

<div style="--accent-color: {accentColor}">
	<ModeWatcher />

	<NavigationBar />
	<main class="flex-grow">{@render children()}</main>
	<Footer />
</div>
