<script lang="ts">
	import type { PageBlock } from '$lib/types/directus-schema';
	import BaseBlock from '../blocks/BaseBlock.svelte';

	interface PageBuilderProps {
		sections: PageBlock[];
	}

	let { sections }: PageBuilderProps = $props();

	const validBlocks = $derived(
		sections.filter(
			(block): block is PageBlock & { collection: string; item: object } =>
				typeof block.collection === 'string' && !!block.item && typeof block.item === 'object'
		)
	);
</script>

<!-- <pre>{JSON.stringify(validBlocks, null, 2)}</pre> -->

{#each validBlocks as block}
	<div class={`py-8 section-${block.background}`}>
		<div
			class="base-container max-w-8xl mx-auto bg-background px-4 text-foreground md:px-8 lg:px-16"
		>
			<BaseBlock {block} />
		</div>
	</div>
{/each}
