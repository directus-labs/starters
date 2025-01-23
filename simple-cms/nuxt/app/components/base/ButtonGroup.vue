<script setup lang="ts">
import type { ButtonProps } from './Button.vue';

export interface ButtonGroupProps {
	buttons: ButtonProps[];
	className?: string;
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
	className: '',
});
</script>

<template>
	<div v-if="buttons?.length" :class="['flex gap-4', className]">
		<Button v-for="button in buttons" :key="button.id" v-bind="button" />
	</div>
</template>
