<script setup lang="ts">
import { setAttr } from '../../utils/setDirectusAttr';

interface TaglineProps {
	tagline?: string | null;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	itemId?: string;
	collection?: string;
}
const { as = 'h2', className = '', tagline, itemId, collection } = defineProps<TaglineProps>();
</script>

<template>
	<component
		:is="as"
		v-if="tagline"
		:class="`font-heading text-accent font-normal uppercase ${className} text-lg md:text-xl lg:text-tagline`"
		:data-directus="
			itemId && collection ? setAttr({ collection, item: itemId, fields: 'tagline', mode: 'popover' }) : undefined
		"
	>
		{{ tagline }}
	</component>
</template>
