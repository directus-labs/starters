<script lang="ts">
	import Hero from '$lib/components/blocks/Hero.svelte';
	import RichText from '$lib/components/blocks/RichText.svelte';
	import Gallery from '$lib/components/blocks/Gallery.svelte';
	// import Pricing from '$lib/components/blocks/Pricing.svelte';
	// import Posts from '$lib/components/blocks/Posts.svelte';

	interface BaseBlockProps {
		block: {
			collection: string;
			item: any;
		};
	}

	const components = {
		block_hero: Hero,
		block_richtext: RichText,
		block_gallery: Gallery,
		block_pricing: Pricing,
		block_posts: Posts
	};
</script>
