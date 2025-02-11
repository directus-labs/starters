<script setup lang="ts">
import { computed } from 'vue';
import { Form } from 'vee-validate';
import { buildZodSchema } from '~/lib/zodSchemaBuilder';
import type { FormField as FormFieldType } from '@@/shared/types/schema';
import FormField from './FormField.vue';

interface Props {
	fields: FormFieldType[];
	onSubmit: (data: Record<string, any>) => Promise<void> | void;
	submitLabel: string;
}

const props = defineProps<Props>();

const sortedFields = computed(() => {
	return [...props.fields].sort((a, b) => (a.sort || 0) - (b.sort || 0));
});

const validFields = computed(() =>
	sortedFields.value.filter(
		(field): field is FormFieldType & { name: string } => field.name != null && field.name !== '',
	),
);

const hasValidFields = computed(() => validFields.value.length > 0);

const schema = computed(() => {
	if (!hasValidFields.value) return null;
	try {
		return buildZodSchema(validFields.value);
	} catch {
		return null;
	}
});

const initialValues = computed(() => {
	if (!hasValidFields.value) return {};

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

const onSubmit = async (values: Record<string, any>) => {
	if (!hasValidFields.value) return;
	await props.onSubmit(values);
};
</script>

<template>
	<Form v-if="schema" :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit">
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
