<script setup lang="ts">
const { name } = defineProps<{
	modelValue: File | null;
	name: string;
}>();

const emits = defineEmits(['update:modelValue']);

const onFileChange = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const file = target.files ? target.files[0] : null;
	emits('update:modelValue', file);
};
</script>

<template>
	<input :id="name" type="file" @change="onFileChange" />
</template>
