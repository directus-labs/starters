<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import { Moon, Sun } from '@lucide/svelte';

	interface props {
		class?: string;
	}

	const { class: className }: props = $props();
</script>

<Button
	onclick={toggleMode}
	variant="outline"
	class={cn(
		'rounded-full border border-gray-300 bg-gray-100 p-1 transition-colors dark:border-gray-600 dark:bg-gray-800',
		className
	)}
>
	{#if mode.current === 'dark'}
		<Sun />
	{:else}
		<Moon />
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
