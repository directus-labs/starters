<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	// Content renders inline (no Portal) so it stays inside the sticky header's
	// stacking context and isn't hidden behind it.
	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: DropdownMenuPrimitive.ContentProps = $props();
</script>

<DropdownMenuPrimitive.Content
	bind:ref
	{sideOffset}
	class={cn(
		'bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border border-input p-2 shadow-md focus:outline-none',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Content>
