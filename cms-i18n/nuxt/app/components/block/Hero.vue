<script setup lang="ts">
interface HeroProps {
	data: {
		id: string;
		tagline: string;
		headline: string;
		description: string;
		layout: 'image_image_left' | 'image_center' | 'image_left';
		image: string;
		button_group?: {
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

const { setAttr } = useVisualEditing();
defineProps<HeroProps>();
</script>

<template>
	<section
		class="relative w-full mx-auto flex flex-col gap-6 md:gap-12"
		:class="{
			'items-center text-center': data.layout === 'image_center',
			'md:flex-row-reverse items-center': data.layout === 'image_left',
			'md:flex-row items-center': data.layout !== 'image_center' && data.layout !== 'image_left',
		}"
	>
		<div
			class="flex flex-col gap-4 w-full"
			:class="{
				'md:w-3/4 xl:w-2/3 items-center': data.layout === 'image_center',
				'md:w-1/2 items-start': data.layout !== 'image_center',
			}"
		>
			<Tagline
				:tagline="data.tagline"
				:data-directus="setAttr({ collection: 'block_hero', item: data.id, fields: 'tagline', mode: 'popover' })"
			/>
			<Headline
				:headline="data.headline"
				:data-directus="setAttr({ collection: 'block_hero', item: data.id, fields: 'headline', mode: 'popover' })"
			/>
			<Text
				v-if="data.description"
				:content="data.description"
				:data-directus="setAttr({ collection: 'block_hero', item: data.id, fields: 'description', mode: 'popover' })"
			/>

			<div
				v-if="data.button_group?.buttons?.length"
				class="mt-6"
				:class="{ 'flex justify-center': data.layout === 'image_center' }"
			>
				<ButtonGroup
					:buttons="data.button_group.buttons"
					:data-directus="
						setAttr({ collection: 'block_button_group', item: data.button_group?.id, fields: 'buttons', mode: 'modal' })
					"
				/>
			</div>
		</div>

		<div
			v-if="data.image"
			class="relative w-full"
			:class="{
				'md:w-3/4 xl:w-2/3 h-[400px]': data.layout === 'image_center',
				'md:w-1/2 h-[562px]': data.layout !== 'image_center',
			}"
		>
			<DirectusImage
				:uuid="data.image"
				:alt="data.tagline || data.headline || 'Hero Image'"
				:fill="true"
				:sizes="data.layout === 'image_center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'"
				class="object-contain"
				:data-directus="
					setAttr({ collection: 'block_hero', item: data.id, fields: ['image', 'layout'], mode: 'modal' })
				"
			/>
		</div>
	</section>
</template>
