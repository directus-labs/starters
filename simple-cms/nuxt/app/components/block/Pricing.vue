<script setup lang="ts">
import { setAttr } from '@directus/visual-editing';

interface PricingProps {
	data: {
		id?: string;
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
const { id, tagline, headline, pricing_cards } = props.data;
</script>

<template>
	<section>
		<Tagline
			v-if="tagline"
			:tagline="tagline"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_pricing', item: id, fields: 'tagline', mode: 'popover' }) }
					: {}
			"
		/>
		<Headline
			v-if="headline"
			:headline="headline"
			v-bind="
				id
					? { 'data-directus': setAttr({ collection: 'block_pricing', item: id, fields: 'headline', mode: 'popover' }) }
					: {}
			"
		/>

		<div
			class="grid gap-6 mt-8"
			:class="{
				'grid-cols-1': pricing_cards.length === 1,
				'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': pricing_cards.length % 3 === 0,
				'grid-cols-1 sm:grid-cols-2': pricing_cards.length % 3 !== 0 && pricing_cards.length !== 1,
			}"
			v-bind="
				id
					? {
							'data-directus': setAttr({
								collection: 'block_pricing',
								item: id,
								fields: ['pricing_cards'],
								mode: 'modal',
							}),
						}
					: {}
			"
		>
			<PricingCard v-for="card in pricing_cards" :key="card.id" :card="card" />
		</div>
	</section>
</template>
