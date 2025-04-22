<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import Search from 'lucide-svelte/icons/search';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(''),
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<div class="flex items-center border-b border-input px-2" data-command-input-wrapper="">
	<Search class="mr-2 size-4 shrink-0 opacity-50 " />
	<CommandPrimitive.Input
		class={cn(
			'placeholder:text-muted-foreground flex h-11 w-full outline-none box-shadow-none rounded-md bg-transparent py-3 text-base focus:border-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:box-shadow-none focus:ring-0 focus:ring-offset-0',
			className
		)}
		bind:ref
		{...restProps}
		bind:value
	/>
</div>
