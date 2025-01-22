<script setup>
import Hero from '~/components/block/Hero.vue';

defineProps({
	type: {
		type: String,
		required: true,
	},
	data: {
		type: Object,
		required: true,
	},
});

const components = {
	block_hero: Hero,
};

const Component = components[type] || null;
</script>

<template>
	<div>
		<component :is="Component" v-if="Component" v-bind="data" class="block" />

		<div v-else class="block">
			<p>Unknown Block Type: {{ type }}</p>
			<pre>{{ JSON.stringify(components, null, 2) }}</pre>
		</div>
	</div>
</template>

<style scoped>
.block {
	margin-bottom: 2rem;
}
</style>
