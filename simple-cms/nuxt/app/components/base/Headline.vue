<script setup lang="ts">
export interface BaseHeadlineProps {
	headline?: string | null;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const props = withDefaults(defineProps<BaseHeadlineProps>(), {
	headline: null,
	className: '',
	as: 'p',
});
</script>

<template>
	<component
		:is="as"
		v-if="headline"
		:class="['font-heading text-foreground font-normal', 'text-4xl md:text-5xl lg:text-headline', className]"
	>
		{{ headline }}
	</component>
</template>
