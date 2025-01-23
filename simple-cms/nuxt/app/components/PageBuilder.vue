<script setup>
defineProps({
	sections: {
		type: Array,
		required: true,
	},
});
</script>
<template>
	<div>
		<div v-for="block in sections" :key="block.id" :class="['section', block.background, block.collection]">
			<Container>
				<BaseBlock :type="block.collection" :data="block.item" />
			</Container>
		</div>
	</div>
</template>
