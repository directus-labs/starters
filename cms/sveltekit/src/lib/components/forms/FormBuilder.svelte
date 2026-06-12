<script lang="ts">
	import type { FormField } from '$lib/types/directus-schema';
	import { cn } from '$lib/utils';
	import { CheckCircle } from '@lucide/svelte';
	import DynamicForm from './DynamicForm.svelte';
	import { goto } from '$app/navigation';

	interface FormBuilderProps {
		class?: string;
		form: {
			id: string;
			on_success?: 'redirect' | 'message' | null;
			sort?: number | null;
			submit_label?: string;
			success_message?: string | null;
			title?: string | null;
			success_redirect_url?: string | null;
			is_active?: boolean | null;
			fields: FormField[];
		};
	}

	const { form, class: className }: FormBuilderProps = $props();

	let isSubmitted = $state(false);
	let error = $state<string | null>(null);

	const handleSubmit = async (data: Record<string, unknown>) => {
		error = null;
		try {
			const fieldsPayload = form.fields.map((field) => ({
				id: field.id,
				name: field.name || '',
				type: field.type || '',
				label: field.label,
				required: field.required,
				validation: field.validation
			}));

			const formData = new FormData();
			formData.append('formId', form.id);
			formData.append('fields', JSON.stringify(fieldsPayload));

			for (const field of fieldsPayload) {
				const value = data[field.name];
				if (value === undefined || value === null) continue;

				if (value instanceof File) {
					formData.append(field.name, value);
				} else if (Array.isArray(value)) {
					formData.append(field.name, JSON.stringify(value));
				} else {
					formData.append(field.name, String(value));
				}
			}

			const response = await fetch('/api/forms/submit', { method: 'POST', body: formData });
			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(typeof body.error === 'string' ? body.error : 'Form submission failed');
			}

			if (form.on_success === 'redirect' && form.success_redirect_url) {
				if (form.success_redirect_url.startsWith('/')) {
					goto(form.success_redirect_url);
				} else {
					window.location.href = form.success_redirect_url;
				}
			} else {
				isSubmitted = true;
			}
		} catch (err) {
			console.error('Error submitting form:', err);
			error = err instanceof Error ? err.message : 'Failed to submit the form. Please try again later.';
		}
	};
</script>

{#if form.is_active}
	{#if isSubmitted}
		<div class="flex flex-col items-center justify-center space-y-4 p-6 text-center">
			<CheckCircle class="size-12 text-green-500" />
			<p class="text-gray-600">
				{form.success_message || 'Your form has been submitted successfully.'}
			</p>
		</div>
	{:else}
		<div class={cn('space-y-6 rounded-lg border border-input p-8', className)}>
			{#if error}
				<div class="rounded-md bg-red-100 p-4 text-red-500">
					<strong>Error:</strong>
					{error}
				</div>
			{/if}
			<DynamicForm
				fields={form.fields}
				onSubmit={handleSubmit}
				submitLabel={form.submit_label || 'Submit'}
				id={form.id}
			/>
		</div>
	{/if}
{/if}
