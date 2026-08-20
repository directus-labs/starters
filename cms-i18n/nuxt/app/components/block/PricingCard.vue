<script setup lang="ts">
import Button from '../base/BaseButton.vue';
import { CheckCircle2 } from 'lucide-vue-next';

interface PricingCardProps {
	card: {
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
	};
}

const props = defineProps<PricingCardProps>();

const { isDraftPreview, setBlockAttr } = useVisualEditingAttrs();

const pricingCardField = (field: string) =>
	setBlockAttr({
		blockCollection: 'block_pricing_cards',
		blockItemId: props.card.id,
		pageFields: `blocks.item:block_pricing.pricing_cards.${field}`,
		fields: [field],
		mode: 'popover',
	});
</script>

<template>
	<div
		:class="[
			'flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6',
			card.is_highlighted ? 'border-accent' : 'border-input',
		]"
	>
		<div class="flex justify-between items-start gap-2 mb-4">
			<h3 class="text-xl font-heading text-foreground" :data-directus="pricingCardField('title')">
				{{ card.title }}
			</h3>
			<div class="flex-shrink-0">
				<Badge
					v-if="card.badge"
					:variant="card.is_highlighted ? 'secondary' : 'default'"
					class="text-xs font-medium uppercase"
					:data-directus="pricingCardField('badge')"
				>
					{{ card.badge }}
				</Badge>
			</div>
		</div>

		<p v-if="card.price" class="text-h2 mt-2 font-semibold" :data-directus="pricingCardField('price')">
			{{ card.price }}
		</p>

		<p
			v-if="card.description"
			class="text-description mt-2 line-clamp-2"
			:data-directus="pricingCardField('description')"
		>
			{{ card.description }}
		</p>

		<hr class="my-4" />

		<div class="flex-grow">
			<ul v-if="card.features" class="space-y-4" :data-directus="pricingCardField('features')">
				<li v-for="(feature, index) in card.features" :key="index" class="flex items-center gap-3 text-regular">
					<CheckCircle2 class="w-4 h-4 text-gray-muted mt-1" />
					<p class="leading-relaxed">{{ feature }}</p>
				</li>
			</ul>
		</div>

		<div class="mt-auto pt-4">
			<Button
				v-if="card.button"
				class="w-full"
				:id="card.button.id"
				:data-directus="
					setBlockAttr(
						isDraftPreview
							? {
									blockCollection: 'block_pricing',
									blockItemId: card.id,
									pageFields: 'blocks.item:block_pricing.pricing_cards.button',
									fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
									mode: 'popover',
								}
							: {
									blockCollection: 'block_button',
									blockItemId: card.button.id,
									fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
									mode: 'popover',
								},
					)
				"
				:label="card.button.label"
				:variant="card.button.variant"
			/>
		</div>
	</div>
</template>
