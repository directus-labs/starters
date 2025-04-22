<script lang="ts">
	import { cn } from '$lib/utils';
	import DirectusImage from '../shared/DirectusImage.svelte';
	import BaseText from '$lib/components/ui/Text.svelte';
	import ButtonGroup from './ButtonGroup.svelte';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';
	import setAttr from '$lib/directus/visualEditing';
	interface Props {
		data: {
			id: string;
			title: string;
			headline: string;
			tagline: string;
			layout: 'center' | 'left' | 'right';
			description: string;
			alignment: 'left' | 'center' | 'right';
			image: string;
			button_group?: {
				id: string;
				buttons: Array<{
					id: string;
					label: string | null;
					variant: string | null;
					url: string | null;
					type: 'url' | 'page' | 'post';
					pagePermalink?: string | null;
					postSlug?: string | null;
				}>;
			};
		};
	}

	let { data }: Props = $props();
	const { alignment, headline, description, image, button_group, tagline, layout, id } =
		$derived(data);
</script>

<section
	class={cn(
		'relative mx-auto flex w-full flex-col gap-6 md:gap-12',
		layout === 'center'
			? 'items-center text-center'
			: layout === 'right'
				? 'items-center md:flex-row-reverse'
				: 'items-center md:flex-row'
	)}
>
	<div
		class={cn(
			'flex w-full flex-col gap-4',
			layout === 'center' ? 'items-center md:w-3/4 xl:w-2/3' : 'items-start md:w-1/2'
		)}
	>
		<Tagline
			{tagline}
			data-directus={setAttr({
				collection: 'block_hero',
				item: id,
				fields: 'tagline',
				mode: 'popover'
			})}
		/>

		{#if headline}
			<Headline
				{headline}
				data-directus={setAttr({
					collection: 'block_hero',
					item: id,
					fields: 'headline',
					mode: 'popover'
				})}
			/>
		{/if}
		{#if description}
			<BaseText
				content={description}
				data-directus={setAttr({
					collection: 'block_hero',
					item: id,
					fields: 'description',
					mode: 'popover'
				})}
			/>
		{/if}
		{#if button_group && button_group.buttons.length > 0}
			<div
				class={cn(alignment === 'center' && 'flex justify-center', 'mt-6')}
				data-directus={setAttr({
					collection: 'block_button_group',
					item: button_group.id,
					fields: 'buttons',
					mode: 'modal'
				})}
			>
				<ButtonGroup buttons={button_group.buttons} />
			</div>
		{/if}
	</div>
	{#if image}
		<div
			class={cn(
				'relative w-full',
				layout === 'center' ? 'h-[400px] md:w-3/4 xl:w-2/3' : 'h-[562px] md:w-1/2'
			)}
			data-directus={setAttr({
				collection: 'block_hero',
				item: id,
				fields: ['image', 'layout'],
				mode: 'modal'
			})}
		>
			<DirectusImage
				uuid={image}
				alt={tagline || headline || 'Hero Image'}
				sizes={layout === 'center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
				class="object-contain"
			/>
		</div>
	{/if}
</section>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
