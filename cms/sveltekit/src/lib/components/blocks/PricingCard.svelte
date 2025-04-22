<script lang="ts">
	import { CheckCircle2 } from 'lucide-svelte';
	import { Badge } from '../ui/badge';
	import { Separator } from '../ui/separator';
	import setAttr from '$lib/directus/visualEditing';
	import Button from './Button.svelte';
	import type { ButtonVariant } from '../ui/button';

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

	let { card }: PricingCardProps = $props();
</script>

<div
	class={`flex max-w-[600px] flex-col rounded-lg border  p-6 md:min-h-[424px] ${
		card.is_highlighted ? 'border-accent' : 'border-input'
	}`}
>
	<!-- {/* Title and Badge */} -->
	<div class="mb-4 flex items-start justify-between gap-2">
		{#if card.title}
			<h3
				class="font-heading text-xl text-foreground"
				data-directus={setAttr({
					collection: 'block_pricing_cards',
					item: card.id,
					fields: ['title'],
					mode: 'popover'
				})}
			>
				{card.title}
			</h3>
		{/if}
		{#if card.badge}
			<div class="flex-shrink-0">
				<Badge
					variant={card.is_highlighted ? 'secondary' : 'default'}
					class="text-xs font-medium uppercase"
					data-directus={setAttr({
						collection: 'block_pricing_cards',
						item: card.id,
						fields: ['badge'],
						mode: 'popover'
					})}
				>
					{card.badge}
				</Badge>
			</div>
		{/if}
	</div>

	{#if card.price}
		<p
			data-directus={setAttr({
				collection: 'block_pricing_cards',
				item: card.id,
				fields: ['price'],
				mode: 'popover'
			})}
			class="mt-2 text-h2 font-semibold"
		>
			{card.price}
		</p>
	{/if}
	{#if card.description}
		<p
			data-directus={setAttr({
				collection: 'block_pricing_cards',
				item: card.id,
				fields: ['description'],
				mode: 'popover'
			})}
			class="mt-2 line-clamp-2 text-description"
		>
			{card.description}
		</p>
	{/if}

	<Separator class="my-4" />

	{#if card.features && Array.isArray(card.features)}
		<div class="flex-grow">
			<ul
				class="space-y-4"
				data-directus={setAttr({
					collection: 'block_pricing_cards',
					item: card.id,
					fields: ['features'],
					mode: 'popover'
				})}
			>
				{#each card.features as feature}
					<li class="flex items-center gap-3 text-regular">
						<div class="mt-1">
							<CheckCircle2 class="size-4 text-gray-muted" />
						</div>
						<p class="leading-relaxed">{feature}</p>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="mt-auto pt-4">
		{#if card.button}
			<div
				data-directus={setAttr({
					collection: 'block_button',
					item: card.button.id,
					fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
					mode: 'popover'
				})}
			>
				<Button
					id={card.button.id}
					block={true}
					variant={card.button.variant as ButtonVariant}
					url={card.button.url}
					label={card.button.label}
				></Button>
			</div>
		{/if}
	</div>
</div>
