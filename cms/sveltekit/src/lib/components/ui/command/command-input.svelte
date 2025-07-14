<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(''),
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<div class="border-input flex items-center border-b px-2" data-command-input-wrapper="">
	<Search class="mr-2 size-4 shrink-0 opacity-50 " />
	<CommandPrimitive.Input
		class={cn(
			'placeholder:text-muted-foreground box-shadow-none focus:box-shadow-none flex h-11 w-full rounded-md bg-transparent py-3 text-base outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			className
		)}
		bind:ref
		{...restProps}
		bind:value
	/>
</div>
