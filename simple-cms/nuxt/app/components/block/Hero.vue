<script setup>
import { computed } from 'vue';

defineProps({
	tagline: {
		type: String,
		required: false,
	},
	headline: {
		type: String,
		required: false,
	},
	description: {
		type: String,
		required: false,
	},
	layout: {
		type: String,
		default: 'left',
		validator: (value) => ['left', 'center', 'right'].includes(value),
	},
	image: {
		type: String,
		required: false,
	},
	buttonGroup: {
		type: Object,
		required: false,
	},
});

const alignmentClass = computed(() => {
	if (layout === 'center') return 'items-center text-center';
	if (layout === 'right') return 'flex-row-reverse text-right';
	return 'text-left';
});
</script>

<template>
	<section class="hero flex flex-col md:flex-row gap-6 md:gap-12 w-full">
		<!-- Text Content -->
		<div :class="['content flex flex-col gap-4', alignmentClass]" :style="{ flex: layout === 'center' ? 1 : 'none' }">
			<p v-if="tagline" class="tagline">{{ tagline }}</p>
			<h1 v-if="headline" class="headline">{{ headline }}</h1>
			<p v-if="description" class="description">{{ description }}</p>
			<ButtonGroup v-if="buttonGroup?.buttons" :buttons="buttonGroup.buttons" class="mt-6" />
		</div>

		<DirectusImage
			v-if="image"
			:uuid="image"
			class="hero-image w-full h-auto object-contain"
			:alt="headline || tagline || 'Hero Image'"
		/>
	</section>
</template>

<style scoped>
.hero {
	margin: 0 auto;
	max-width: 1200px;
	padding: 2rem;
}

.content {
	flex: 1;
}

.tagline {
	font-size: 1.25rem;
	color: var(--color-primary);
	font-weight: 600;
}

.headline {
	font-size: 2rem;
	font-weight: bold;
}

.description {
	font-size: 1rem;
	color: var(--color-text);
}

.hero-image {
	max-height: 400px;
}
</style>
