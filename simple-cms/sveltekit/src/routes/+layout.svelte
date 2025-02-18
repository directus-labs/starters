<script lang="ts">
	import '../globals.css';
	import '../fonts.css';
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { getDirectusAssetURL } from '$lib/directus/directus-utils';
	import { page } from '$app/state';

	let { children } = $props();

	const siteTitle = $derived(page.data.globals?.title || 'Simple CMS');
	const siteDescription = $derived(
		page.data.globals?.description || 'A starter CMS template powered by Next.js and Directus.'
	);
	const faviconURL = $derived(
		page.data.globals?.favicon ? getDirectusAssetURL(page.data.globals.favicon) : '/favicon.ico'
	);
</script>

<!-- <THEMEPROVIDER></THEMEPROVIDER> -->

<svelte:head>
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<link rel="icon" href={faviconURL} />
</svelte:head>

<ModeWatcher />

<NavigationBar />
<main class="flex-grow">{@render children()}</main>
<Footer />
