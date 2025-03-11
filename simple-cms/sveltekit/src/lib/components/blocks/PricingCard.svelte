<script lang="ts">
	import { CheckCircle2 } from 'lucide-svelte';
	import { Badge } from '../ui/badge';
	import { Button } from '../ui/button';
	import { Separator } from '../ui/separator';

	// interface PricingCardProps {
	// 	card: {
	// 		id: string;
	// 		title: string;
	// 		description?: string;
	// 		price?: string;
	// 		badge?: string;
	// 		features?: string[];
	// 		button?: {
	// 			label: string | null;
	// 			variant: 'link' | 'secondary' | 'default' | 'destructive' | 'outline' | 'ghost' | undefined;
	// 			url: string | null;
	// 		};
	// 		is_highlighted?: boolean;
	// 	};
	// }

	let { card } = $props();
</script>

<div
	class={`flex max-w-[600px] flex-col rounded-lg border p-6 md:min-h-[424px] ${
		card.is_highlighted ? 'border-accent' : 'border-gray-300'
	}`}
>
	<!-- {/* Title and Badge */} -->
	<div class="flex items-center justify-between">
		{#if card.title}
			<h3 class="text-[32px] font-normal text-foreground">{card.title}</h3>
		{/if}
		{#if card.badge}
			<Badge
				variant={card.is_highlighted ? 'secondary' : 'default'}
				class="px-2 py-1 text-sm font-medium uppercase"
			>
				{card.badge}
			</Badge>
		{/if}
	</div>

	{#if card.price}
		<p class="mt-4 font-heading text-h2">{card.price}</p>
	{/if}
	{#if card.description}
		<p class="mt-2 text-description">{card.description}</p>
	{/if}

	<Separator class="my-4" />

	{#if card.features && Array.isArray(card.features)}
		<ul class="space-y-4">
			{#each card.features as feature, index}
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
			<Button variant={card.button.variant} href={card.button.url}>{card.button.label}</Button>
		{/if}
	</div>
</div>
