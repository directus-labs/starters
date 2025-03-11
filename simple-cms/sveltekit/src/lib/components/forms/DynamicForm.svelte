<script lang="ts">
	import type { FormField as FormFieldType } from '$lib/types/directus-schema';
	import { buildZodSchema } from '$lib/zodSchemaBuilder';
	import Button from '../blocks/Button.svelte';
	import Field from './FormField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	interface DynamicFormProps {
		fields: FormFieldType[];
		onSubmit: (data: Record<string, any>) => void;
		submitLabel: string;
	}

	const { fields, onSubmit, submitLabel }: DynamicFormProps = $props();

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
	const { enhance, submit, form: formData } = $derived(form);

	const onsubmit = (e: Event) => {
		e.preventDefault();
		onSubmit($formData);
	};
</script>

<form class="flex flex-wrap gap-4" {onsubmit}>
	{#each sortedFields as field (field.id)}
		<Field {field} {form} />
	{/each}

	<div class="w-full">
		<Button
			type="submit"
			icon="arrow"
			label={submitLabel}
			iconPosition="right"
			id={`submit-${submitLabel.replace(/\s+/g, '-').toLowerCase()}`}
		></Button>
	</div>
</form>
