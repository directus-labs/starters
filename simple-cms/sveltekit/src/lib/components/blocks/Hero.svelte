<script lang="ts">
	import { cn } from '$lib/utils';
	import DirectusImage from '../shared/DirectusImage.svelte';
	import BaseText from '$lib/components/ui/Text.svelte';
	import ButtonGroup from './ButtonGroup.svelte';
	import type { ButtonProps } from '../ui/button';
	import Headline from '../ui/Headline.svelte';
	import Title from '../ui/Title.svelte';

	interface Props {
		data: {
			title: string;
			headline: string;
			description: string;
			alignment: 'left' | 'center' | 'right';
			image: string;
			button_group?: {
				buttons: Array<ButtonProps>;
			};
		};
	}

	let { data }: Props = $props();
	const { alignment, title, headline, description, image, button_group } = data;
</script>

<section
	class={cn(
		'relative mx-auto flex w-full max-w-screen-lg flex-col gap-6 px-4 md:min-h-[60vh] md:gap-12',
		alignment === 'center'
			? 'items-center text-center'
			: alignment === 'right'
				? 'items-center md:flex-row-reverse'
				: 'items-center md:flex-row'
	)}
>
	<div
		class={cn(
			'flex w-full flex-col gap-4',
			alignment === 'center' ? 'items-center md:w-1/2' : 'items-start md:w-1/2'
		)}
	>
		{#if title}
			<Title {title} />
		{/if}
		{#if headline}
			<Headline {headline} />
		{/if}
		{#if description}
			<BaseText content={description} />
		{/if}
		{#if button_group && button_group.buttons.length > 0}
			<div class={cn(alignment === 'center' && 'flex justify-center', 'mt-6')}>
				<ButtonGroup buttons={button_group.buttons} />
			</div>
		{/if}
	</div>
	{#if image}
		<div
			class={cn('relative w-full', alignment === 'center' ? 'h-[400px]' : 'h-[562px]', 'md:w-1/2')}
		>
			<DirectusImage
				id={image}
				alt={title || 'Hero Image'}
				fill
				sizes={alignment === 'center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
			/>
		</div>
	{/if}
</section>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
