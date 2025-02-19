<script setup lang="ts">
import { computed } from 'vue';

interface TextProps {
	content?: string;
	as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
	className?: string;
}

const props = defineProps<TextProps>();

const safeContent = computed(() => props.content ?? '');
</script>

<template>
	<component
		:is="as"
		v-if="safeContent"
		:class="['prose dark:prose-invert', `text-${size}`, className]"
		v-html="safeContent"
	/>
	<component :is="as" v-else :class="[`text-${size}`, className]">
		<slot />
	</component>
</template>
