<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	import { Search } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command/index.js';

	import { debounce } from '$lib/utils';
	import Badge from './badge/badge.svelte';

	let open = $state(false);
	let search = $state('');
	let searched = $state(false);
	let loading = $state(false);
	let results = $state<SearchResult[]>([]);

	$inspect({ open, search, searched, loading, results });

	type SearchResult = {
		id: string;
		title: string;
		description: string;
		type: string;
		link: string;
	};

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	$effect(() => {
		if (!open) {
			results = [];
			searched = false;
			loading = false;
		}
	});

	const fetchResults = async (search: string) => {
		if (search.length < 3 || !open) {
			results = [];
			// searched = false;
			return;
		}

		loading = true;
		// searched = true;

		try {
			const res = await fetch(`/api/search?search=${encodeURIComponent(search)}`);
			if (!res.ok) throw new Error('Failed to fetch results');
			const data: SearchResult[] = await res.json();
			results = data.filter((r) => r.link);
		} catch (error) {
			console.error('Error fetching search results:', error);
			results = [];
		} finally {
			loading = false;
		}
	};
	const debouncedFetchResults = debounce(fetchResults, 300);

	$effect(() => {
		debouncedFetchResults(search);
	});
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="max-w-full sm:max-w-[540px]">
	<Button variant="ghost" size="icon" aria-label="Search" onclick={() => (open = true)}>
		<Search className="size-5" />
	</Button>

	<Command.Dialog bind:open shouldFilter={false}>
		<Command.Input placeholder="Type a command or search..." bind:value={search} />
		<Command.List>
			<Command.Empty>No results found.</Command.Empty>

			{#if results.length > 0}
				<Command.Group heading="Search Results">
					{#each results as result}
						<Command.Item>
							<Badge variant="default">{result.type}</Badge>
							{result.title}
						</Command.Item>
					{/each}
				</Command.Group>
			{/if}
		</Command.List>
	</Command.Dialog>
</div>

<!-- <Command.Dialog bind:open>
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Suggestions">
      <Command.Item>Calendar</Command.Item>
      <Command.Item>Search Emoji</Command.Item>
      <Command.Item>Calculator</Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog> -->
