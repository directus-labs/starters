<script lang="ts">
	import Hero from '$lib/components/blocks/Hero.svelte';
	import RichText from '$lib/components/blocks/RichText.svelte';
	import Gallery from '$lib/components/blocks/Gallery.svelte';
	import Pricing from '$lib/components/blocks/Pricing.svelte';
	import Posts from '$lib/components/blocks/Posts.svelte';
	import Form from '$lib/components/blocks/Form.svelte';
	interface BaseBlockProps {
		block: {
			collection: string;
			item: any;
			id: string;
		};
	}

	let { block }: BaseBlockProps = $props();

	const components = {
		block_hero: Hero,
		block_richtext: RichText,
		block_gallery: Gallery,
		block_pricing: Pricing,
		block_posts: Posts,
		block_form: Form
	} as const;

	const Component = $derived(components[block.collection as keyof typeof components]);
</script>

{#if Component}
	<Component data={block.item} />
{:else}
	<div>
		<h1>Block not found {block.collection}</h1>
	</div>
{/if}
