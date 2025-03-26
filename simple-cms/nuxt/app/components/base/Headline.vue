<script setup lang="ts">
import { setAttr } from '../../utils/setDirectusAttr';
import { computed } from 'vue';

interface HeadlineProps {
	headline?: string | null;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
	itemId?: string;
	collection?: string;
}

const props = defineProps<HeadlineProps>();

const headline = computed(() => props.headline);
const itemId = computed(() => props.itemId);
const collection = computed(() => props.collection);
const asTag = computed(() => props.as || 'p');
const className = computed(() => props.className || '');
</script>

<template>
	<component
		:is="asTag"
		v-if="headline"
		:class="`font-heading text-foreground font-normal ${className} text-4xl md:text-5xl lg:text-headline`"
		:data-directus="
			itemId && collection ? setAttr({ collection, item: itemId, fields: 'headline', mode: 'popover' }) : undefined
		"
	>
		{{ headline }}
	</component>
</template>
