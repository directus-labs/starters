<script setup lang="ts">
interface TaglineProps {
	tagline?: string | null;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

withDefaults(defineProps<TaglineProps>(), {
	as: 'h2',
});
</script>

<template>
	<component
		:is="as"
		v-if="tagline"
		:class="`font-heading text-accent font-normal uppercase text-lg md:text-xl lg:text-tagline`"
	>
		{{ tagline }}
	</component>
</template>
