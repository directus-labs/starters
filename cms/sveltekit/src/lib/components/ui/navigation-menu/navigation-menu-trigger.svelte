<script lang="ts" module>
	import { cn } from '$lib/utils.js';
	import { tv } from 'tailwind-variants';

	export const navigationMenuTriggerStyle = tv({
		base: 'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm  transition-colors hover:text-accent focus:text-accent focus:text-accent focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:text-accent/50 data-[state=open]:text-accent/50'
	});
</script>

<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: NavigationMenuPrimitive.TriggerProps = $props();
</script>

<NavigationMenuPrimitive.Trigger
	bind:ref
	data-slot="navigation-menu-trigger"
	class={cn(navigationMenuTriggerStyle(), 'group', className)}
	{...restProps}
>
	{@render children?.()}

	<ChevronDownIcon
		class="relative top-px ms-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
		aria-hidden="true"
	/>
</NavigationMenuPrimitive.Trigger>
