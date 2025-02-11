<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const props = defineProps<{
	modelValue: string[];
	name: string;
	options: { value: string; text: string }[];
}>();

const emits = defineEmits(['update:modelValue']);

const isChecked = (value: string) => props.modelValue.includes(value);

const toggleValue = (value: string, checked: boolean) => {
	let updatedValues = [...props.modelValue];

	if (checked) {
		updatedValues.push(value);
	} else {
		updatedValues = updatedValues.filter((v) => v !== value);
	}

	emits('update:modelValue', updatedValues);
};
</script>

<template>
	<div>
		<div v-for="option in props.options" :key="option.value" class="flex items-center gap-x-2">
			<Checkbox
				:id="`${props.name}-${option.value}`"
				:checked="isChecked(option.value)"
				@update:checked="(checked) => toggleValue(option.value, checked)"
			/>
			<Label :for="`${props.name}-${option.value}`" class="text-sm">
				{{ option.text }}
			</Label>
		</div>
	</div>
</template>
