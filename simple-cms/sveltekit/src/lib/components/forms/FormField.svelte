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

	interface FieldProps {
		field: FormFieldType;
		form: SuperForm<any>;
	}

	const { field, form }: FieldProps = $props();

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

<!-- bind:value={formData[field.name]} -->
{#if field.type !== 'hidden'}
	<div class={`flex-shrink-0 ${widthClass}`}>
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
					/>
				{:else if field.type === 'textarea'}
					<Textarea
						placeholder={field.placeholder || ''}
						name={field.name || ''}
						bind:value={$formData[field.name!]}
					/>
				{:else if field.type === 'checkbox'}
					<Checkbox name={field.name} bind:checked={$formData[field.name!]} />
				{:else if field.type === 'checkbox_group'}
					<CheckBoxGroup name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'select'}
					<SelectField name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'radio'}
					<RadioGroup name={field.name || ''} options={field.choices || []} {form} />
				{:else if field.type === 'file'}
					<FileUploadField name={field.name || ''} {form} />
				{:else}
					<!-- <FieldComponent
			placeholder={field.placeholder || ''}
			name={field.name}
			{...field.type === 'select' ? { options: field.options || [] } : {}}
	/> -->
					<p>Unknown field type: {field.type}</p>
				{/if}
			</Form.Control>
		</Form.Field>
	</div>
{/if}
