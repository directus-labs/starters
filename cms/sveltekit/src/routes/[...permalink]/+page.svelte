<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
	import PageBuilder from '$lib/components/layout/PageBuilder.svelte';
	import type { PageBlock } from '$lib/types/directus-schema.js';
	import Button from '$lib/components/ui/Button.svelte';
	import { Pencil } from 'lucide-svelte';
	import { setAttr } from '$lib/directus/visualEditing';

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

<div class="relative">
	<PageBuilder sections={blocks} />
	{#if page.data.visualEditingEnabled}
		<div class="fixed inset-x-0 bottom-4 z-50 flex w-full items-center justify-center gap-2 p-4">
			<Button
				id="visual-editing-button"
				variant="secondary"
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
