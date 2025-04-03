<script lang="ts">
	import { CheckCircle2 } from 'lucide-svelte';
	import { Badge } from '../ui/badge';
	import { Button, type ButtonVariant } from '../ui/button';
	import { Separator } from '../ui/separator';
	import setAttr from '$lib/directus/visualEditing';

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
	class={`flex max-w-[600px] flex-col rounded-lg border p-6 md:min-h-[424px] ${
		card.is_highlighted ? 'border-accent' : 'border-gray-300'
	}`}
>
	<!-- {/* Title and Badge */} -->
	<div class="flex items-center justify-between">
		{#if card.title}
			<h3
				class="text-[32px] font-normal text-foreground"
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
			<Badge
				variant={card.is_highlighted ? 'secondary' : 'default'}
				class="px-2 py-1 text-sm font-medium uppercase"
				data-directus={setAttr({
					collection: 'block_pricing_cards',
					item: card.id,
					fields: ['badge'],
					mode: 'popover'
				})}
			>
				{card.badge}
			</Badge>
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
			class="mt-4 font-heading text-h2"
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
			class="mt-2 text-description"
		>
			{card.description}
		</p>
	{/if}

	<Separator class="my-4" />

	{#if card.features && Array.isArray(card.features)}
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
						<CheckCircle2 className="size-4 text-gray-muted" />
					</div>
					<p class="leading-relaxed">{feature}</p>
				</li>
			{/each}
		</ul>
	{/if}
	<div class="mt-auto pt-4">
		{#if card.button}
			<Button
				data-directus={setAttr({
					collection: 'block_button',
					item: card.button.id,
					fields: ['type', 'label', 'variant', 'url', 'page', 'post'],
					mode: 'popover'
				})}
				variant={card.button.variant as ButtonVariant}
				href={card.button.url}>{card.button.label}</Button
			>
		{/if}
	</div>
</div>
