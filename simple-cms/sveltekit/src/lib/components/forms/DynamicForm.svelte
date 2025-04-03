<script lang="ts">
	import { dev } from '$app/environment';
	import setAttr from '$lib/directus/visualEditing';
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
		id: string;
	}

	const { fields, onSubmit, submitLabel, id }: DynamicFormProps = $props();

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

	const { enhance, submit, form: formData, errors, validateForm } = $derived(form);

	const onsubmit = async (e: Event) => {
		e.preventDefault();
		// const f = await superValidate($formData, zod(formSchema));
		const f = await validateForm();
		$errors = f.errors;
		if (f.valid) {
			onSubmit($formData);
		}
	};
</script>

<form
	class="flex flex-wrap gap-4"
	{onsubmit}
	data-directus={setAttr({
		collection: 'forms',
		item: id,
		fields: 'fields',
		mode: 'popover'
	})}
>
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
	{#if dev}
		<div class="flex w-full flex-col gap-2 rounded-xl bg-red-200 p-2">
			<p class="text-center text-red-500">Form Debugger. This is not displayed in production</p>
			{#await superValidate($formData, zod(formSchema)) then r}
				<SuperDebug data={r} />
			{/await}
		</div>
	{/if}
</form>
