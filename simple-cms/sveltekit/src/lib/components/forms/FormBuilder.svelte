<script lang="ts">
	import { submitForm } from '$lib/directus/forms';
	import type { FormField } from '$lib/types/directus-schema';
	import { cn } from '$lib/utils';
	import { CheckCircle } from 'lucide-svelte';
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

	const handleSubmit = async (data: Record<string, any>) => {
		try {
			const fieldsWithNames = form.fields.map((field) => ({
				id: field.id,
				name: field.name || '',
				type: field.type || ''
			}));
			await submitForm(form.id, fieldsWithNames, data);

			if (form.on_success === 'redirect' && form.success_redirect_url) {
				if (form.success_redirect_url.startsWith('/')) {
					goto(form.success_redirect_url);
				} else {
					window.location.href = form.success_redirect_url; // TODO check if internal or external
				}
			} else {
				isSubmitted = true;
			}
		} catch (err) {
			console.error('Error submitting form:', err);
			error = 'Failed to submit the form. Please try again later.';
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
