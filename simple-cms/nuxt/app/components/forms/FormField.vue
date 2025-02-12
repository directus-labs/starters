<script setup lang="ts">
import { computed } from 'vue';
import { useField } from 'vee-validate';
import FormItem from '~/components/ui/form/FormItem.vue';
import FormLabel from '~/components/ui/form/FormLabel.vue';
import FormControl from '~/components/ui/form/FormControl.vue';
import FormMessage from '~/components/ui/form/FormMessage.vue';
import Input from '~/components/ui/input/Input.vue';
import { Textarea } from '../ui/textarea';
import CheckboxField from './fields/CheckboxField.vue';
import CheckboxGroupField from './fields/CheckboxGroupField.vue';
import RadioGroupField from './fields/RadioGroupField.vue';
import SelectField from './fields/SelectField.vue';
import FileUploadField from './fields/FileUploadField.vue';
import { Info } from 'lucide-vue-next';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip';
import type { FormField } from '../../../shared/types/schema';

const props = defineProps<{
	field: FormField;
}>();

const { value, errorMessage } = useField(props.field.name ?? '');

const getFieldComponent = () => {
	switch (props.field.type) {
		case 'textarea':
			return Textarea;
		case 'checkbox':
			return CheckboxField;
		case 'checkbox_group':
			return CheckboxGroupField;
		case 'radio':
			return RadioGroupField;
		case 'select':
			return SelectField;
		case 'file':
			return FileUploadField;
		case 'hidden':
			return null;
		case 'text':
		default:
			return Input;
	}
};

const getComponentProps = (field: FormField) => {
	const baseProps = {
		id: field.id,
		name: field.name ?? '',
		placeholder: field.placeholder ?? '',
	};

	if (field.type === 'file') {
		return {
			...baseProps,
			modelValue: value.value as File | null,
			'onUpdate:modelValue': (val: File | null) => (value.value = val),
		};
	}

	if (field.type === 'checkbox') {
		return {
			...baseProps,
			label: field.label ?? '',
			modelValue: value.value as boolean,
			'onUpdate:modelValue': (val: boolean) => (value.value = val),
		};
	}

	if (field.type === 'checkbox_group') {
		return {
			...baseProps,
			options: field.choices ?? [],
			modelValue: value.value as string[],
			'onUpdate:modelValue': (val: string[]) => (value.value = val),
		};
	}

	if (field.type === 'radio' || field.type === 'select') {
		return {
			...baseProps,
			options: field.choices ?? [],
			modelValue: value.value as string,
			'onUpdate:modelValue': (val: string) => (value.value = val),
		};
	}

	// text, textarea
	return {
		...baseProps,
		modelValue: value.value as string,
		'onUpdate:modelValue': (val: string) => (value.value = val),
	};
};

const widthClass = computed(() => {
	const mapping: Record<string, string> = {
		'100': 'flex-[100%]',
		'50': 'flex-[calc(50%-1rem)]',
		'67': 'flex-[calc(67%-1rem)]',
		'33': 'flex-[calc(33%-1rem)]',
	};
	return mapping[props.field.width ?? '100'] || 'flex-[100%]';
});
</script>

<template>
	<div v-if="props.field.type !== 'hidden'" :class="widthClass">
		<FormItem class="pt-2">
			<FormLabel :for="field.name ?? ''" class="flex items-center justify-between">
				<div class="flex items-center space-x-1 h-[20px]">
					<span v-if="field.type !== 'checkbox'">{{ field.label ?? '' }}</span>
					<TooltipProvider v-if="field.help">
						<Tooltip>
							<TooltipTrigger>
								<Info class="w-4 h-4 text-gray-500 cursor-pointer" />
							</TooltipTrigger>
							<TooltipContent>{{ field.help }}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<span v-if="field.required" class="text-sm text-gray-400">*Required</span>
			</FormLabel>
			<FormControl class="h-10">
				<component :is="getFieldComponent()" v-bind="getComponentProps(field)" />
			</FormControl>
			<FormMessage v-if="errorMessage" className="text-red-500 italic text-sm">{{ errorMessage }}</FormMessage>
		</FormItem>
	</div>
</template>
