<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Moon, Sun } from '@lucide/svelte';

	const Icon = $derived(mode.current === 'dark' ? Sun : Moon);
</script>

<Button
	onclick={toggleMode}
	variant="outline"
	size="icon-sm"
	class="rounded-full border border-gray-300 bg-gray-100 transition-colors dark:border-gray-600 dark:bg-gray-800"
>
	<Icon />
	<span class="sr-only">Toggle theme</span>
</Button>
