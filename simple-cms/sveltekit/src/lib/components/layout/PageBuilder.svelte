<script lang="ts">
	import type { PageBlock } from '$lib/types/directus-schema';
	import BaseBlock from '../blocks/BaseBlock.svelte';
	import Container from '../ui/Container.svelte';

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

{#each validBlocks as block}
	<div class="py-16" data-background={block.background}>
		<Container>
			<BaseBlock {block} />
		</Container>
	</div>
{/each}
