<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonGroupProps } from '../base/ButtonGroup.vue';
import ButtonGroup from '../base/ButtonGroup.vue';

export interface HeroProps {
	tagline?: string | null;
	headline?: string | null;
	description?: string | null;
	layout?: 'left' | 'center' | 'right';
	image?: string | null;
	buttonGroup?: ButtonGroupProps | null;
}

const props = withDefaults(defineProps<HeroProps>(), {
	layout: 'left',
});

const alignmentClass = computed(() => {
	if (props.layout === 'center') return 'items-center text-center';
	if (props.layout === 'right') return 'flex-row-reverse text-right';
	return 'text-left';
});
</script>

<template>
	<section class="hero flex flex-col md:flex-row gap-6 md:gap-12 w-full">
		<!-- Text Content -->
		<div :class="['content flex flex-col gap-4', alignmentClass]" :style="{ flex: layout === 'center' ? 1 : 'none' }">
			<p v-if="tagline" class="tagline">{{ tagline }}</p>
			<h2 v-if="headline" class="headline">{{ headline }}</h2>
			<p v-if="description" class="description">{{ description }}</p>
			<ButtonGroup v-if="buttonGroup" :buttons="buttonGroup.buttons" class="mt-6" />
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
