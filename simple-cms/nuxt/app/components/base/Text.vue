<script setup lang="ts">
import { computed } from 'vue';

interface TextProps {
	content?: string;
	as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
	className?: string;
}

const props = withDefaults(defineProps<TextProps>(), {
	as: 'p',
	size: 'md',
	content: undefined,
	className: '',
});

const element = computed(() => props.as);

const sizeClasses = computed(() => {
	return {
		'text-2xs sm:text-xs': props.size === 'xs',
		'text-xs sm:text-sm': props.size === 'sm',
		'text-sm sm:text-base': props.size === 'md',
		'text-base sm:text-lg': props.size === 'lg',
		'text-lg sm:text-xl': props.size === 'xl',
		'text-xl sm:text-2xl': props.size === '2xl',
		'text-2xl sm:text-3xl': props.size === '3xl',
		'text-3xl sm:text-4xl': props.size === '4xl',
		'text-4xl sm:text-5xl': props.size === '5xl',
		'text-5xl sm:text-6xl': props.size === '6xl',
	};
});
</script>

<template>
	<component
		:is="element"
		v-if="content"
		:class="['prose dark:prose-invert', sizeClasses, className]"
		v-html="content"
	/>
	<component :is="element" v-else :class="[sizeClasses, className]">
		<slot />
	</component>
</template>
