<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface CheckboxGroupFieldProps {
		name: string;
		options: { value: string; text: string }[];
		// form: UseFormReturn<any>;
		form?: any;
	}

	const { name = 'unknown', options, form }: CheckboxGroupFieldProps = $props();
</script>

<div>
	{#each options as option (option.value)}
		<div class="flex items-center gap-x-2">
			<Checkbox id={`${name}-${option.value}`} />
			<!-- checked={currentValues.includes(option.value)}
				onCheckedChange={(checked) => toggleValue(option.value, !!checked)} -->
			<label for={`${name}-${option.value}`} class="text-sm">
				{option.text}
			</label>
		</div>
	{/each}
</div>
