<script lang="ts">
	import PageBuilder from '$lib/components/layout/PageBuilder.svelte';
	import type { PageBlock } from '../../../types/directus-schema.js';

	let { data } = $props();

	const blocks: PageBlock[] = $derived.by(() => {
		if (!data.blocks) return [];
		return data.blocks.filter(
			(block: any): block is PageBlock => typeof block === 'object' && block.collection
		);
	});
</script>

<svelte:head>
	<title>{data.title || ''}</title>
	<meta name="description" content={data.description || ''} />
</svelte:head>

<PageBuilder sections={blocks} />

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
