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

	let activeLabel = $derived(
		options.find((option) => option.value === $formData[name])?.text ||
			placeholder ||
			'Select an option'
	);
</script>

<!-- onValueChange={(value) => form.setValue(name, value)} value={form.getValues(name)} -->
<Select.Root type="single" {name} bind:value={$formData[name]}>
	<Select.Trigger>
		{activeLabel}
	</Select.Trigger>
	<Select.Content class="bg-background">
		{#each options as option (option.value)}
			<Select.Item value={option.value}>
				{option.text}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
