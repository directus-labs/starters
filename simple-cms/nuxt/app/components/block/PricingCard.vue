<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next';
import Button from '../base/BaseButton.vue';

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
</script>

<template>
	<div
		:class="[
			'flex flex-col max-w-[600px] md:min-h-[424px] border rounded-lg p-6',
			props.card.is_highlighted ? 'border-accent' : 'border-input',
		]"
	>
		<div class="flex justify-between items-start gap-2 mb-4">
			<h3 class="text-xl font-heading text-foreground">
				{{ props.card.title }}
			</h3>
			<div class="flex-shrink-0">
				<Badge
					v-if="props.card.badge"
					:variant="props.card.is_highlighted ? 'secondary' : 'default'"
					class="text-xs font-medium uppercase"
				>
					{{ props.card.badge }}
				</Badge>
			</div>
		</div>

		<p v-if="props.card.price" class="text-h2 mt-2 font-semibold">
			{{ props.card.price }}
		</p>

		<p v-if="props.card.description" class="text-description mt-2 line-clamp-2">
			{{ props.card.description }}
		</p>

		<hr class="my-4" />

		<div class="flex-grow">
			<ul v-if="props.card.features" class="space-y-4">
				<li v-for="(feature, index) in props.card.features" :key="index" class="flex items-center gap-3 text-regular">
					<CheckCircle2 class="w-4 h-4 text-gray-muted mt-1" />
					<p class="leading-relaxed">{{ feature }}</p>
				</li>
			</ul>
		</div>

		<div class="mt-auto pt-4">
			<Button
				v-if="props.card.button"
				id="props.card.button.uuid"
				:label="props.card.button.label"
				:variant="props.card.button.variant"
				:url="props.card.button.url"
				block
			/>
		</div>
	</div>
</template>
