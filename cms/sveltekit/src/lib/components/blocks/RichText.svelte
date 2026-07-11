<script lang="ts">
	import { setBlockAttr } from '$lib/directus/visualEditing';
	import { cn } from '$lib/utils';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';
	import Text from '../ui/Text.svelte';

	interface RichTextProps {
		data: {
			id: string;
			headline?: string;
			content: string;
			alignment?: 'left' | 'center' | 'right';
			tagline?: string;
		};
		class?: string;
	}

	let { data, class: className }: RichTextProps = $props();

	const { headline, content, alignment = 'left', tagline, id } = $derived(data);
</script>

<div
	class={cn(
		'mx-auto max-w-[600px] space-y-6',
		alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left',
		className
	)}
>
	{#if tagline}
		<Tagline
			{tagline}
			data-directus={setBlockAttr({
				blockCollection: 'block_richtext',
				blockItemId: id,
				fields: 'tagline',
				mode: 'popover'
			})}
		/>
	{/if}
	{#if headline}
		<Headline
			{headline}
			data-directus={setBlockAttr({
				blockCollection: 'block_richtext',
				blockItemId: id,
				fields: 'headline',
				mode: 'popover'
			})}
		/>
	{/if}
	{#if content}
		<Text
			{content}
			data-directus={setBlockAttr({
				blockCollection: 'block_richtext',
				blockItemId: id,
				fields: 'content',
				mode: 'drawer'
			})}
		/>
	{/if}
</div>
