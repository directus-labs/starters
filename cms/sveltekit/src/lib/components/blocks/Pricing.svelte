<script lang="ts">
	import setAttr from '$lib/directus/visualEditing';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';
	import PricingCard from './PricingCard.svelte';

	interface PricingCardType {
		id: string;
		title: string;
		description?: string;
		price?: string;
		badge?: string;
		features?: string[];
		button?: {
			id: string;
			label: string | null;
			variant: string | null;
			url: string | null;
		};
		is_highlighted?: boolean;
	}

	interface PricingData {
		id: string;
		tagline?: string;
		headline?: string;
		pricing_cards: PricingCardType[];
	}

	interface PricingProps {
		data: PricingData;
	}

	const { data }: PricingProps = $props();
	const { tagline, headline, pricing_cards, id } = $derived(data);

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
		{#if tagline}
			<Tagline
				{tagline}
				data-directus={setAttr({
					collection: 'block_pricing',
					item: id,
					fields: 'tagline',
					mode: 'popover'
				})}
			/>
		{/if}
		{#if headline}
			<Headline
				{headline}
				data-directus={setAttr({
					collection: 'block_pricing',
					item: id,
					fields: 'headline',
					mode: 'popover'
				})}
			/>
		{/if}

		<div
			class={`grid gap-6 ${gridClasses} ${containerStyles}`}
			data-directus={setAttr({
				collection: 'block_pricing',
				item: id,
				fields: ['pricing_cards'],
				mode: 'modal'
			})}
		>
			{#each pricing_cards as card (card.id)}
				<PricingCard {card} />
			{/each}
		</div>
	</section>
{/if}
