<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface CheckboxGroupFieldProps {
		name: string;
		options: { value: string; text: string }[];
		form?: any;
	}

	const { name = 'unknown', options, form }: CheckboxGroupFieldProps = $props();

	let { form: formData } = $derived(form);
</script>

<div>
	{#each options as option (option.value)}
		<div class="flex items-center gap-x-2">
			<Checkbox
				id={`${name}-${option.value}`}
				checked={$formData[name]}
				onCheckedChange={(checked) => {
					formData[name] = checked;
				}}
			/>
			<label for={`${name}-${option.value}`} class="text-sm">
				{option.text}
			</label>
		</div>
	{/each}
</div>
