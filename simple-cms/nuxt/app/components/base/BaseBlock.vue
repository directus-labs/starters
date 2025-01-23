<script setup lang="ts">
import { computed } from 'vue';
import Hero from '~/components/block/Hero.vue';

export interface BaseBlockProps {
	type: string;
	data: Record<string, unknown>;
}

const props = defineProps<BaseBlockProps>();

const components = {
	block_hero: Hero,
};

const Component = computed(() => components[props.type] || null);
</script>

<template>
	<div>
		<component :is="Component" v-if="Component" v-bind="data" class="block" />
	</div>
</template>

<style scoped>
.block {
	margin-bottom: 2rem;
}
</style>
