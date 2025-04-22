<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import PageBuilder from '$lib/components/layout/PageBuilder.svelte';
	import type { PageBlock } from '$lib/types/directus-schema.js';

	let { data } = $props();

	const blocks: PageBlock[] = $derived.by(() => {
		if (!data.blocks) return [];
		return data.blocks.filter(
			(block: any): block is PageBlock => typeof block === 'object' && block.collection
		);
	});

	$effect(() => {
		if (page.data.visualEditingEnabled) {
			applyVisualEditing();
		}
	});

	const applyVisualEditing = async () => {
		const { apply } = await import('@directus/visual-editing');
		apply({
			directusUrl: PUBLIC_DIRECTUS_URL,
			onSaved: async () => {
				await invalidateAll();
			}
		});
	};
</script>

<svelte:head>
	<title>{data.title || ''}</title>
	<meta name="description" content={data.description || ''} />
</svelte:head>

<PageBuilder sections={blocks} />
