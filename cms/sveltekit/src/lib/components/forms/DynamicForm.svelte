<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import setAttr from '$lib/directus/visualEditing';
	import { buildZodSchema } from '$lib/zodSchemaBuilder';
	import Button from '../blocks/Button.svelte';
	import type { FormBuilderProps } from './formBuilderTypes';
	import Field from './FormField.svelte';
	import { superForm } from 'sveltekit-superforms';

	import { zodClient } from 'sveltekit-superforms/adapters';
	const {
		form: formProp,
		onSubmitted,
		onError
	}: FormBuilderProps & { onSubmitted: () => void; onError: () => void } = $props();

	const fields = $derived(formProp.fields);
	const submitLabel = $derived(formProp.submit_label);
	const id = $derived(formProp.id);

	const sortedFields = $derived([...fields].sort((a, b) => (a.sort || 0) - (b.sort || 0)));
	const formSchema = $derived(buildZodSchema(fields));

	const defaultValues = $derived(
		fields.reduce<Record<string, any>>((defaults, field) => {
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
		}, {})
	);

	const form = $derived(
		superForm(defaultValues, {
			validators: zodClient(formSchema),
			SPA: true
		})
	);

	const { form: formData, errors, validateForm } = $derived(form);
</script>

<form
	enctype="multipart/form-data"
	class="flex flex-wrap gap-4"
	method="POST"
	action={`/?/createFormSubmission`}
	use:enhance={async ({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted
		const f = await validateForm();
		$errors = f.errors;
		if (!f.valid) {
			console.error('Form is not valid', f);
			onError();
			cancel();
		}

		return async ({ result }) => {
			console.log('formProp', formProp);
			// `result` is an `ActionResult` object
			if (formProp.on_success === 'redirect' && formProp.success_redirect_url) {
				if (formProp.success_redirect_url.startsWith('/')) {
					goto(formProp.success_redirect_url);
				} else {
					window.location.href = formProp.success_redirect_url; // TODO check if internal or external
				}
			} else if (result.type === 'failure') {
				onError();
				cancel();
				console.error('result is 400', result);
			} else {
				onSubmitted();
			}
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}}
	data-directus={setAttr({
		collection: 'forms',
		item: id,
		fields: 'fields',
		mode: 'popover'
	})}
>
	<!-- add a hidden field for the form id -->
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
				id={`submit-${submitLabel?.replace(/\s+/g, '-').toLowerCase()}`}
			></Button>
		</div>
	</div>

	<!-- HIDE FORM DEBUGGER -->
	<!-- {#if dev}
		<div class="flex w-full flex-col gap-2 rounded-xl bg-red-200 p-2">
			<p class="text-center text-red-500">Form Debugger. This is not displayed in production</p>
			{#await superValidate($formData, zod(formSchema)) then r}
				<SuperDebug data={r} />
			{/await}
		</div>
	{/if} -->
</form>
