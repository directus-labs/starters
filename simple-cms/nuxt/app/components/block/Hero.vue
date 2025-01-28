<script setup lang="ts">
import { computed } from 'vue';
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

const layoutClasses = computed(() => {
	if (props.data.layout === 'image_center') return 'items-center text-center';
	if (props.data.layout === 'image_left') return 'md:flex-row-reverse items-center';
	return 'md:flex-row items-center';
});

const contentClasses = computed(() => {
	const baseClasses = 'flex flex-col gap-4 w-full';
	if (props.data.layout === 'image_center') return `${baseClasses} md:w-3/4 xl:w-2/3 items-center`;
	return `${baseClasses} md:w-1/2 items-start`;
});

const imageContainerClasses = computed(() => {
	if (props.data.layout === 'image_center') return 'relative w-full md:w-3/4 xl:w-2/3 h-[400px]';
	return 'relative w-full md:w-1/2 h-[562px]';
});

const imageSizes = computed(() => (props.data.layout === 'image_center' ? '100vw' : '(max-width: 768px) 100vw, 50vw'));

const { tagline, headline, description, image, layout, button_group } = computed(() => props.data).value;
</script>
<template>
	<section :class="['relative w-full mx-auto flex flex-col gap-6 md:gap-12', layoutClasses]">
		<div :class="contentClasses">
			<Tagline :tagline="tagline" />
			<Headline :headline="headline" />
			<Text v-if="description" :content="description" />

			<div v-if="button_group?.buttons?.length" :class="[layout === 'image_center' && 'flex justify-center', 'mt-6']">
				<ButtonGroup :buttons="button_group.buttons" />
			</div>
		</div>

		<div v-if="image" :class="imageContainerClasses">
			<DirectusImage
				:uuid="image"
				:alt="tagline || headline || 'Hero Image'"
				:fill="true"
				:sizes="imageSizes"
				class="object-contain"
			/>
		</div>
	</section>
</template>
