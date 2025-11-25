<script lang="ts">
	import { cn } from '$lib/utils';
	import { CheckCircle } from '@lucide/svelte';
	import DynamicForm from './DynamicForm.svelte';
	import type { FormBuilderProps } from './formBuilderTypes';

	const { form, class: className }: FormBuilderProps = $props();

	let isSubmitted = $state(false);
	let error = $state<string | null>(null);
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
		<div class={cn('border-input space-y-6 rounded-lg border p-8', className)}>
			{#if error}
				<div class="rounded-md bg-red-100 p-4 text-red-500">
					<strong>Error:</strong>
					{error}
				</div>
			{/if}
			<DynamicForm
				{form}
				onSubmitted={() => (isSubmitted = true)}
				onError={() => (error = 'Failed to submit the form. Please try again later.')}
			/>
		</div>
	{/if}
{/if}
