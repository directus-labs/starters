<script lang="ts">
	import Title from '../ui/Title.svelte';
	import Headline from '../ui/Headline.svelte';
	import PricingCard from './PricingCard.svelte';

	interface PricingProps {
		data: {
			title?: string;
			headline?: string;
			pricing_cards: Array<{
				id: string;
				title: string;
				description?: string;
				price?: string;
				badge?: string;
				features?: string[];
				button?: {
					label: string | null;
					variant: string | null;
					url: string | null;
				};
				is_highlighted?: boolean;
			}>;
		};
	}

	const { data }: PricingProps = $props();
	const { title, headline, pricing_cards } = $derived(data);

	const gridClasses = $derived.by(() => {
		if (pricing_cards.length === 1) return 'grid-cols-1';
		if (pricing_cards.length === 2) return 'grid-cols-1 sm:grid-cols-2';

		return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
	});

	const containerStyles = $derived(() => {
		pricing_cards.length === 1 || pricing_cards.length === 2
			? 'mx-auto max-w-screen-md'
			: 'max-w-full';
	});
</script>

{#if pricing_cards || Array.isArray(pricing_cards)}
	<section class="space-y-8">
		{#if title}
			<Title {title} />
		{/if}
		{#if headline}
			<Headline {headline} />
		{/if}

		<div class={`grid gap-6 ${gridClasses} ${containerStyles}`}>
			{#each pricing_cards as card}
				<PricingCard {card} />
			{/each}
		</div>
	</section>
{/if}
