<script lang="ts">
	import { cn } from '$lib/utils';
	import Button, { type ButtonProps } from './Button.svelte';

	interface ButtonGroupProps {
		buttons: Array<ButtonProps>;
		[key: string]: any;
	}

	let { buttons, ...props }: ButtonGroupProps = $props();

	const containerClasses = $derived(cn('flex gap-4', props.class));
</script>

{#if buttons && buttons.length > 0}
	<div class={containerClasses}>
		{#each buttons as button, index}
			<Button {...button}>{button.label}</Button>
		{/each}
	</div>
{/if}
