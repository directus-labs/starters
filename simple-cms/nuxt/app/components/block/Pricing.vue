<script setup lang="ts">
interface PricingProps {
	data: {
		tagline?: string;
		headline?: string;
		pricing_cards: Array<{
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
		}>;
	};
}

const props = defineProps<PricingProps>();

const gridClasses = computed(() => {
	const length = props.data.pricing_cards.length;
	if (length === 1) return 'grid-cols-1';
	if (length % 3 === 0) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
	return 'grid-cols-1 sm:grid-cols-2';
});
</script>

<template>
	<section>
		<Tagline v-if="data.tagline" :tagline="data.tagline" />
		<Headline v-if="data.headline" :headline="data.headline" />

		<div :class="`grid gap-6 mt-8 ${gridClasses}`">
			<PricingCard v-for="card in data.pricing_cards" :key="card.id" :card="card" />
		</div>
	</section>
</template>
