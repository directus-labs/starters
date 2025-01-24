<script setup lang="ts">
import { computed } from 'vue';
import Hero from '~/components/block/Hero.vue';
import RichText from '~/components/block/RichText.vue';

interface BaseBlockProps {
	block: {
		collection: string;
		item: any;
		id: string;
	};
}

const props = defineProps<BaseBlockProps>();

const components: Record<string, any> = {
	block_hero: Hero,
	block_richtext: RichText,
};

const Component = computed(() => components[props.block.collection] || null);
</script>
<template>
	<component :is="Component" v-if="Component" :id="`block-${block.id}`" :data="block.item" />
</template>
