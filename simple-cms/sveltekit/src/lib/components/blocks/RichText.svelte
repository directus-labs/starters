<script lang="ts">
	import { cn } from '$lib/utils';
	import Title from '../ui/Headline.svelte';
	import Headline from '../ui/Headline.svelte';
	import Text from '../ui/Text.svelte';

	interface RichTextProps {
		data: {
			title?: string;
			headline?: string;
			content: string;
			alignment?: 'left' | 'center' | 'right';
		};
		className?: string;
	}

	let { data, className }: RichTextProps = $props();

	const { title, headline, content, alignment = 'left' } = data;
</script>

<div
	class={cn(
		'mx-auto max-w-[600px] space-y-6',
		alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left',
		className
	)}
>
	{#if title}
		<Title {title} />
	{/if}
	{#if headline}
		<Headline {headline} />
	{/if}
	<Text {content} />
</div>
