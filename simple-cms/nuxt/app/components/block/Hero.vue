<script setup lang="ts">
import Text from '~/components/base/Text.vue';
import DirectusImage from '~/components/shared/DirectusImage.vue';

interface HeroProps {
	data: {
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

const props = defineProps<HeroProps>();

const { tagline, headline, description, image, layout, button_group } = props.data;
</script>

<template>
	<section
		class="relative w-full mx-auto flex flex-col gap-6 md:gap-12"
		:class="{
			'items-center text-center': layout === 'image_center',
			'md:flex-row-reverse items-center': layout === 'image_left',
			'md:flex-row items-center': layout !== 'image_center' && layout !== 'image_left',
		}"
	>
		<div
			class="flex flex-col gap-4 w-full"
			:class="{
				'md:w-3/4 xl:w-2/3 items-center': layout === 'image_center',
				'md:w-1/2 items-start': layout !== 'image_center',
			}"
		>
			<Tagline :tagline="tagline" />
			<Headline :headline="headline" />
			<Text v-if="description" :content="description" />

			<div
				v-if="button_group?.buttons?.length"
				class="mt-6"
				:class="{ 'flex justify-center': layout === 'image_center' }"
			>
				<ButtonGroup :buttons="button_group.buttons" />
			</div>
		</div>

		<div
			v-if="image"
			class="relative w-full"
			:class="{
				'md:w-3/4 xl:w-2/3 h-[400px]': layout === 'image_center',
				'md:w-1/2 h-[562px]': layout !== 'image_center',
			}"
		>
			<DirectusImage
				:uuid="image"
				:alt="tagline || headline || 'Hero Image'"
				:fill="true"
				:sizes="layout === 'image_center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'"
				class="object-contain"
			/>
		</div>
	</section>
</template>
