<script lang="ts">
	import { dev } from '$app/environment';
	import type { FormField as FormFieldType } from '$lib/types/directus-schema';
	import { buildZodSchema } from '$lib/zodSchemaBuilder';
	import Button from '../blocks/Button.svelte';
	import Field from './FormField.svelte';
	import { superForm, superValidate } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';

	import { zodClient, zod } from 'sveltekit-superforms/adapters';

	interface DynamicFormProps {
		fields: FormFieldType[];
		onSubmit: (data: Record<string, any>) => void;
		submitLabel: string;
	}

	const { fields, onSubmit, submitLabel }: DynamicFormProps = $props();

	const sortedFields = [...fields].sort((a, b) => (a.sort || 0) - (b.sort || 0));
	const formSchema = buildZodSchema(fields);

	console.log('fields', fields);
	console.log('formSchema', formSchema);

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

	const { enhance, submit, form: formData, allErrors } = $derived(form);

	const onsubmit = async (e: Event) => {
		e.preventDefault();
		// const f = await superValidate($formData, zod(formSchema));
		const f = await form.validateForm();
		console.log('form validated', f);
		form.errors.set(f.errors);
		console.log('superform', form);
		console.log('errors', $allErrors);
		if (f.valid) {
			onSubmit($formData);
		}
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
	{#if dev}
		<div class="flex w-full flex-col gap-2 rounded-xl bg-red-200 p-2">
			<p class="text-center text-red-500">Form Debugger. This is not displayed in production</p>
			{#await superValidate($formData, zod(formSchema)) then r}
				<SuperDebug data={r} />
			{/await}
		</div>
	{/if}
</form>
