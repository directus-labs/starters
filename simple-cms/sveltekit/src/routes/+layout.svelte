<script lang="ts">
	import '../globals.css';
	import '../fonts.css';
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	let { children } = $props();
</script>

<!-- <THEMEPROVIDER></THEMEPROVIDER> -->

<NavigationBar />
<main class="min-h-screen px-2 md:px-8 lg:px-16">{@render children()}</main>
<Footer />
