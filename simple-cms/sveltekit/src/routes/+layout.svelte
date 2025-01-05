<script lang="ts">
	import '../globals.css';
	import '../fonts.css';
	let { children } = $props();
</script>

<!-- <THEMEPROVIDER></THEMEPROVIDER> -->

<main class="min-h-screen px-2 md:px-8 lg:px-16">{@render children()}</main>
