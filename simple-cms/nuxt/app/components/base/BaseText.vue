<script setup lang="ts">
import { computed } from 'vue';

export interface TextProps {
	as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

const props = withDefaults(defineProps<TextProps>(), {
	as: 'p',
	size: 'md',
});

const element = computed(() => props.as);
</script>

<template>
	<component
		:is="element"
		:class="[
			{
				'text-2xs sm:text-xs': size === 'xs',
				'text-xs sm:text-sm': size === 'sm',
				'text-sm sm:text-base': size === 'md',
				'text-base sm:text-lg': size === 'lg',
				'text-lg sm:text-xl': size === 'xl',
				'text-xl sm:text-2xl': size === '2xl',
				'text-2xl sm:text-3xl': size === '3xl',
				'text-3xl sm:text-4xl': size === '4xl',
				'text-4xl sm:text-5xl': size === '5xl',
				'text-5xl sm:text-6xl': size === '6xl',
			},
		]"
	>
		<slot></slot>
	</component>
</template>
