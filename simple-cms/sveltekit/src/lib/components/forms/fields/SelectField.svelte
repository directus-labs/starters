<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	interface SelectFieldProps {
		name: string;
		options: { value: string; text: string }[];
		placeholder?: string | null;
		form?: any;
	}

	const { name, options, placeholder, form }: SelectFieldProps = $props();

	let triggerContent = $state(placeholder || 'Select an option');
	let value = $state('');

	// TODO: Add onValueChange event
	// TODO E

	const handleValueChange = (value: string) => {
		// form.setValue(name, value);
		console.log('new value', value);
	};
</script>

<!-- onValueChange={(value) => form.setValue(name, value)} value={form.getValues(name)} -->
<Select.Root type="single" {name} onValueChange={handleValueChange}>
	<Select.Trigger>
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value}>
				{option.text}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
