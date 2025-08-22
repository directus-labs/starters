<script lang="ts">
	import setAttr from '$lib/directus/visualEditing';
	import type { FormField as FormFieldType } from '$lib/types/directus-schema';
	import { buildZodSchema } from '$lib/zodSchemaBuilder';
	import Button from '../blocks/Button.svelte';
	import Field from './FormField.svelte';
	import { superForm, superValidate } from 'sveltekit-superforms';
	import { submitForm } from './forms.remote';

	import { zodClient, zod } from 'sveltekit-superforms/adapters';

	interface DynamicFormProps {
		fields: FormFieldType[];
		submitLabel: string;
		id: string;
	}

	const { fields, submitLabel, id }: DynamicFormProps = $props();

	const sortedFields = [...fields].sort((a, b) => (a.sort || 0) - (b.sort || 0));
	const formSchema = buildZodSchema(fields);

	const defaultValues = fields.reduce<Record<string, any>>((defaults, field) => {
		if (!field.name) return defaults;
		switch (field.type) {
			case 'checkbox':
				defaults[field.name] = false;
				break;
			case 'checkbox_group':
				defaults[field.name] = [];
				break;
			case 'radio':
				defaults[field.name] = '';
				break;
			default:
				defaults[field.name] = '';
				break;
		}

		return defaults;
	}, {});

	const form = superForm(defaultValues, {
		validators: zodClient(formSchema),
		SPA: true
	});
</script>

<form
	class="flex flex-wrap gap-4"
	enctype="multipart/form-data"
	{...submitForm.enhance(async ({ form, data, submit }) => {
		try {
			await submit();
			form.reset();
			console.log('result', submitForm.result);
		} catch (error) {
			console.log('something went wrong', error);
		}
	})}
	data-directus={setAttr({
		collection: 'forms',
		item: id,
		fields: 'fields',
		mode: 'popover'
	})}
>
	<input type="hidden" name="formId" value={id} />

	{#each sortedFields as field (field.id)}
		<Field {field} {form} />
	{/each}

	<div class="w-full">
		<div
			data-directus={setAttr({
				collection: 'forms',
				item: id,
				fields: 'submit_label',
				mode: 'popover'
			})}
		>
			<Button
				type="submit"
				icon="arrow"
				label={submitLabel}
				iconPosition="right"
				id={`submit-${submitLabel.replace(/\s+/g, '-').toLowerCase()}`}
			></Button>
		</div>
	</div>
</form>
