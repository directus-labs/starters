<script setup lang="ts">
import { computed } from 'vue';
import { Field } from 'vee-validate';
import FormItem from '~/components/ui/form/FormItem.vue';
import FormLabel from '~/components/ui/form/FormLabel.vue';
import FormControl from '~/components/ui/form/FormControl.vue';
import FormMessage from '~/components/ui/form/FormMessage.vue';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui/tooltip';
import Input from '~/components/ui/input/Input.vue';
import { Textarea } from '../ui/textarea';
import CheckboxField from './fields/CheckboxField.vue';
import CheckboxGroupField from './fields/CheckboxGroupField.vue';
import RadioGroupField from './fields/RadioGroupField.vue';
import SelectField from './fields/SelectField.vue';
import FileUploadField from './fields/FileUploadField.vue';
import { cn } from '@@/shared/utils';
import { Info } from 'lucide-vue-next';

const props = defineProps<{
	field: {
		id: string;
		name: string;
		type: string;
		label?: string;
		placeholder?: string;
		help?: string;
		required?: boolean;
		choices?: { value: string; text: string }[];
		width?: number;
		sort?: number;
		validation?: string;
	};
}>();

const getFieldComponent = () => {
	switch (props.field.type) {
		case 'text':
			return Input;
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
		default:
			return Input;
	}
};

const getComponentProps = (field: typeof props.field) => {
	if (field.type === 'select') {
		return {
			name: field.name,
			options: field.choices || [],
			placeholder: field.placeholder,
		};
	}

	return {
		field,
		placeholder: field.placeholder,
	};
};

const widthClass = computed(() => {
	if (props.field.width) {
		const mapping: Record<number, string> = {
			100: 'flex-[100%]',
			50: 'flex-[calc(50%-1rem)]',
			67: 'flex-[calc(67%-1rem)]',
			33: 'flex-[calc(33%-1rem)]',
		};
		return mapping[props.field.width] || 'flex-[100%]';
	}

	return 'flex-[100%]';
});

const labelClass = computed(() => {
	let base = 'text-sm font-medium flex items-center justify-between';

	if (props.field.type === 'checkbox' || props.field.type === 'radio') {
		base += ' space-x-2';
	}

	return cn(base);
});
</script>

<template>
	<Field :name="field.name">
		<template #default="{ field: fieldProps, meta }">
			<div :class="widthClass">
				<FormItem>
					<FormLabel :for="field.name" :class="labelClass">
						<div class="flex items-center space-x-1">
							<template v-if="field.type !== 'checkbox'">
								<span>{{ field.label }}</span>
							</template>
							<template v-if="field.help">
								<TooltipProvider>
									<Tooltip>
										<template #trigger>
											<TooltipTrigger>
												<Info class="w-4 h-4 text-gray-500 cursor-pointer" />
											</TooltipTrigger>
										</template>
										<TooltipContent>{{ field.help }}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</template>
						</div>
						<template v-if="field.required">
							<span class="text-sm text-gray-400">*Required</span>
						</template>
					</FormLabel>
					<FormControl>
						<component :is="getFieldComponent()" v-model="fieldProps.value" v-bind="getComponentProps(field)" />
					</FormControl>
					<FormMessage class="text-red-500 italic text-sm" />
				</FormItem>
			</div>
		</template>
	</Field>
</template>
