<script setup lang="ts">
import { computed } from 'vue';
import Text from '../base/Text.vue';

interface RichTextProps {
	data: {
		tagline?: string;
		headline?: string;
		content?: string;
		alignment?: 'left' | 'center' | 'right';
		className?: string;
	};
}

const alignmentClasses = computed(() => {
	switch (props.data.alignment) {
		case 'center':
			return 'text-center';
		case 'right':
			return 'text-right';
		default:
			return 'text-left';
	}
});
const props = defineProps<RichTextProps>();
</script>

<template>
	<div :class="['mx-auto max-w-[600px] space-y-6', alignmentClasses, props.data.className]">
		<Tagline v-if="data.tagline" :tagline="data.tagline" />
		<Headline v-if="data.headline" :headline="data.headline" />
		<Text v-if="data.content" :content="data.content" />
	</div>
</template>
