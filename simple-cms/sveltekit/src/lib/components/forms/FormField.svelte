<script lang="ts">
	import type { FormField as FormFieldType } from '$lib/types/directus-schema';
	import { Checkbox } from '../ui/checkbox';
	import Input from '../ui/input/input.svelte';
	import { Textarea } from '../ui/textarea';
	import CheckBoxGroup from './fields/CheckBoxGroupField.svelte';
	import RadioGroup from './fields/RadioGroup.svelte';
	import SelectField from './fields/SelectField.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import type { SuperForm } from 'sveltekit-superforms';
	import FileUploadField from './fields/FileUploadField.svelte';
	import { cn } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Info } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label/index.js';

	interface FieldProps {
		field: FormFieldType;
		form: SuperForm<any>;
	}

	const { field, form }: FieldProps = $props();

	const { errors } = $derived(form);

	const fieldName = field.name as string;

	const { form: formData } = form;
	const widthClass = field.width
		? {
				100: 'flex-[100%]',
				50: 'flex-[calc(50%-1rem)]',
				67: 'flex-[calc(67%-1rem)]',
				33: 'flex-[calc(33%-1rem)]'
			}[field.width] || 'flex-[100%]'
		: 'flex-[100%]';
</script>

{#if field.type !== 'hidden'}
	<div class={`flex flex-shrink-0 flex-col justify-center ${widthClass}`}>
		<Form.Field {form} name={field.name!}>
			<Form.Control>
				<Form.Label
					class={cn(
						'flex items-center justify-between text-sm font-medium',
						field.type === 'checkbox' || field.type === 'radio' ? 'space-x-2' : ''
					)}
				>
					<div class="flex items-center space-x-1">
						{#if field.type !== 'checkbox'}
							{field.label}
						{/if}
						{#if field.help}
							<Tooltip.Provider>
								<Tooltip.Root>
									<Tooltip.Trigger>
										<Info class="ml-1 size-4 cursor-pointer text-gray-500" />
									</Tooltip.Trigger>
									<Tooltip.Content class="bg-background">
										{field.help}
									</Tooltip.Content>
								</Tooltip.Root>
							</Tooltip.Provider>
						{/if}
					</div>
					{#if field.required}
						<span class="text-sm text-gray-400">*Required</span>
					{/if}
				</Form.Label>

				{#if field.type === 'text'}
					<Input
						placeholder={field.placeholder || ''}
						name={field.name || ''}
						bind:value={$formData[field.name!]}
						type={field.validation?.includes('email') ? 'email' : 'text'}
					/>
				{:else if field.type === 'textarea'}
					<Textarea
						placeholder={field.placeholder || ''}
						name={field.name || ''}
						bind:value={$formData[field.name!]}
						required={field.required}
					/>
				{:else if field.type === 'checkbox'}
					<div class="flex items-center space-x-3">
						<Checkbox
							name={field.name}
							bind:checked={$formData[field.name!]}
							required={!!field.required}
						/>
						<Label for={field.name}>{field.label}</Label>
					</div>
				{:else if field.type === 'checkbox_group'}
					<CheckBoxGroup name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'select'}
					<SelectField name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'radio'}
					<RadioGroup name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'file'}
					<FileUploadField name={field.name || ''} {form} />
				{:else}
					<p>Unknown field type: {field.type}</p>
				{/if}
			</Form.Control>
			<Form.Description>{field.help}</Form.Description>
			{#if $errors[fieldName]}
				<Form.FieldErrors>
					{#each $errors[fieldName] as string[] as error}
						<p class="text-red-500">{error}</p>
					{/each}
				</Form.FieldErrors>
			{/if}
		</Form.Field>
	</div>
{/if}
