<script setup lang="ts">
interface HeadlineProps {
	content: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'title';
	color?: 'foreground' | 'subdued' | 'primary' | 'secondary';
	shadow?: boolean;
}

withDefaults(defineProps<HeadlineProps>(), {
	as: 'h2',
	size: 'md',
	color: 'foreground',
	shadow: false,
});
</script>
<template>
	<component
		:is="as"
		:class="[
			{
				'text-shadow': shadow,
			},
			{
				'text-xl': size === 'xs',
				'text-2xl': size === 'sm',
				'text-2xl md:text-3xl': size === 'md',
				'text-3xl md:text-4xl': size === 'lg',
				'text-2xl md:text-5xl': size === 'xl',
				'xs:text-5xl text-4xl md:text-7xl': size === 'title',
			},
			{
				'text-': color === 'subdued',
				'text-white': color === 'foreground',
				'text-[var(--ui-primary)]': color === 'primary',
				'text-red-800': color === 'secondary',
			},
			'color-em font-serif font-bold leading-none tracking-tight',
		]"
	>
		<span v-html="content" />
	</component>
</template>

<style>
.color-em {
	em {
		@apply text-[var(--ui-primary)] not-italic;
	}
}

.text-shadow {
	text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
</style>
