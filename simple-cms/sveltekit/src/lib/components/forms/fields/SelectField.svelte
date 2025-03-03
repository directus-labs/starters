<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	interface SelectFieldProps {
		name: string;
		options: { value: string; text: string }[];
		placeholder?: string | null;
		form?: any;
	}

	const { name, options, placeholder, form }: SelectFieldProps = $props();

	let { form: formData } = form;

	let triggerContent = $state(placeholder || 'Select an option');

	let activeLabel = $derived(
		options.find((option) => option.value === $formData[name])?.text || triggerContent
	);
</script>

<!-- onValueChange={(value) => form.setValue(name, value)} value={form.getValues(name)} -->
<Select.Root type="single" {name} bind:value={$formData[name]}>
	<Select.Trigger>
		{activeLabel}
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value}>
				{option.text}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
