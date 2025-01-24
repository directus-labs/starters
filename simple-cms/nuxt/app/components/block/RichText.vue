<script setup lang="ts">
import { ref, computed } from 'vue';

interface RichTextProps {
	tagline?: string;
	headline?: string;
	content?: string;
	alignment?: 'left' | 'center' | 'right';
	className?: string;
}

const props = withDefaults(defineProps<RichTextProps>(), {
	alignment: 'left',
	tagline: undefined,
	headline: undefined,
	className: '',
});

const textRef = ref<HTMLElement | null>(null);

const alignmentClasses = computed(() => {
	switch (props.alignment) {
		case 'center':
			return 'text-center';
		case 'right':
			return 'text-right';
		default:
			return 'text-left';
	}
});

defineExpose({
	textRef,
});
</script>

<template>
	<div :class="['mx-auto max-w-[600px] space-y-6', alignmentClasses, className]">
		<Tagline v-if="tagline" :tagline="tagline" />
		<Headline v-if="headline" :headline="headline" />
		<Text v-if="content" ref="textRef" :content="content" />
	</div>
</template>
