<script lang="ts">
	import { page } from '$app/state';
	import PageBuilder from '$lib/components/layout/PageBuilder.svelte';
	import type { PageBlock } from '$lib/types/directus-schema.js';
	import { Button } from '$lib/components/ui/button';
	import { Pencil } from '@lucide/svelte';
	import { setAttr } from '$lib/directus/visualEditing';
	import { getPage } from '$lib/directus/fetchers.remote';

	// let { data } = $props();

	const data = $derived(await getPage('/' + page.params.permalink));

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

<div class="relative">
	<PageBuilder sections={blocks} />
	{#if page.data.visualEditingEnabled && data.id}
		<div class="fixed inset-x-0 bottom-4 z-50 flex w-full items-center justify-center gap-2 p-4">
			<!-- If you're not using the visual editor it's safe to remove this element. Just a helper to let editors add edit / add new blocks to a page. -->
			<Button
				id="visual-editing-button"
				variant="secondary"
				class="visual-editing-button-class"
				data-directus={setAttr({
					collection: 'pages',
					item: data.id,
					fields: ['blocks', 'meta_m2a_button'],
					mode: 'modal'
				})}
			>
				<Pencil class="mr-2 size-4" />
				Edit All Blocks
			</Button>
		</div>
	{/if}
</div>

<style>
	/* Safe to remove this if you're not using the visual editor. */
	:global(
		.directus-visual-editing-overlay.visual-editing-button-class
			.directus-visual-editing-edit-button
	) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform: none;
		background: transparent;
	}
</style>
