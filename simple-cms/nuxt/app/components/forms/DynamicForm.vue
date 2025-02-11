<script setup lang="ts">
import { computed } from 'vue';
import { Form } from 'vee-validate';
import { buildZodSchema } from '~/lib/zodSchemaBuilder';
import type { FormField as FormFieldType } from '@@/shared/types/schema';
import FormField from './FormField.vue';

interface Props {
	fields: FormFieldType[];
	onSubmit: (data: Record<string, any>) => void;
	submitLabel: string;
}

const props = defineProps<Props>();

const sortedFields = computed(() => [...props.fields].sort((a, b) => (a.sort || 0) - (b.sort || 0)));

const validFields = computed(() =>
	sortedFields.value.filter((field): field is FormFieldType & { name: string } => field.name != null),
);

const schema = computed(() => buildZodSchema(validFields.value));

const initialValues = computed(() => {
	return validFields.value.reduce(
		(defaults, field) => {
			const name = field.name;

			switch (field.type) {
				case 'checkbox':
					defaults[name] = false;
					break;
				case 'checkbox_group':
					defaults[name] = [];
					break;
				case 'radio':
					defaults[name] = '';
					break;
				default:
					defaults[name] = '';
					break;
			}

			return defaults;
		},
		{} as Record<string, any>,
	);
});

const onSubmit = (values: Record<string, any>) => {
	props.onSubmit(values);
};
</script>
<template>
	<Form :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit">
		<div class="flex flex-wrap gap-4">
			<FormField v-for="field in validFields" :key="field.id" :field="field" />
			<div class="w-full">
				<Button
					:id="`submit-${submitLabel.replace(/\s+/g, '-').toLowerCase()}`"
					type="submit"
					:label="submitLabel"
					icon="arrow"
					icon-position="right"
				/>
			</div>
		</div>
	</Form>
</template>
