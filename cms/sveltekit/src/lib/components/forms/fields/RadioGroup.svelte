<script lang="ts">
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface RadioGroupFieldProps {
		name: string;
		options: { value: string; text: string }[];
		form?: any;
	}

	const { name, options, form }: RadioGroupFieldProps = $props();

	let { form: formData } = $derived(form);
</script>

<!-- value={form.watch(name)} -->
<!-- onValueChange={(value) => form.setValue(name, value)} -->
<RadioGroup.Root bind:value={$formData[name]}>
	{#each options as option (option.value)}
		<div class="flex items-center gap-x-2">
			<RadioGroup.Item id={`${name}-${option.value}`} value={option.value} />
			<label for={`${name}-${option.value}`} class="text-sm">
				{option.text}
			</label>
		</div>
	{/each}
</RadioGroup.Root>
