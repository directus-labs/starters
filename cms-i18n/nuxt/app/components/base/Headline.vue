<script setup lang="ts">
interface HeadlineProps {
	headline?: string | null;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

withDefaults(defineProps<HeadlineProps>(), {
	as: 'h2',
});
</script>

<template>
	<component
		:is="as"
		v-if="headline"
		:class="`font-heading text-foreground font-normal text-4xl md:text-5xl lg:text-headline`"
	>
		{{ headline }}
	</component>
</template>
