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

const { setAttr } = useVisualEditing();

defineProps<PricingCardProps>();
</script>

<template>
	<div
		:class="[
			'flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6',
			card.is_highlighted ? 'border-accent' : 'border-input',
		]"
	>
		<div class="flex justify-between items-start gap-2 mb-4">
			<h3
				class="text-xl font-heading text-foreground"
				:data-directus="
					setAttr({ collection: 'block_pricing_cards', item: card.id, fields: ['title'], mode: 'popover' })
				"
			>
				{{ card.title }}
			</h3>
			<div class="flex-shrink-0">
				<Badge
					v-if="card.badge"
					:variant="card.is_highlighted ? 'secondary' : 'default'"
					class="text-xs font-medium uppercase"
					:data-directus="
						setAttr({
							collection: 'block_pricing_cards',
							item: card.id,
							fields: ['badge'],
							mode: 'popover',
						})
					"
				>
					{{ card.badge }}
				</Badge>
			</div>
		</div>

		<p
			v-if="card.price"
			class="text-h2 mt-2 font-semibold"
			:data-directus="setAttr({ collection: 'block_pricing_cards', item: card.id, fields: ['price'], mode: 'popover' })"
		>
			{{ card.price }}
		</p>

		<p
			v-if="card.description"
			class="text-description mt-2 line-clamp-2"
			:data-directus="
				setAttr({ collection: 'block_pricing_cards', item: card.id, fields: ['description'], mode: 'popover' })
			"
		>
			{{ card.description }}
		</p>

		<hr class="my-4" />

		<div class="flex-grow">
			<ul
				v-if="card.features"
				class="space-y-4"
				:data-directus="
					setAttr({ collection: 'block_pricing_cards', item: card.id, fields: ['features'], mode: 'popover' })
				"
			>
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
				id="card.button.uuid"
				:data-directus="
					setAttr({
						collection: 'block_button',
						item: card.button.id,
						fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
						mode: 'popover',
					})
				"
				:label="card.button.label"
				:variant="card.button.variant"
			/>
		</div>
	</div>
</template>
