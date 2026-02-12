<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	import { Search } from '@lucide/svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import { Debounced } from 'runed';

	import Badge from './badge/badge.svelte';

	let open = $state(false);
	let search = $state('');
	let searched = $state(false);
	let loading = $state(false);
	let results = $state<SearchResult[]>([]);

	type SearchResult = {
		id: string;
		title: string;
		description: string;
		type: string;
		link: string;
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	};

	$effect(() => {
		if (!open) {
			// results = [];
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

	$effect(() => {
		fetchResults(debouncedSearch.current);
	});

	const debouncedSearch = new Debounced(() => search, 300);
</script>

<svelte:document onkeydown={handleKeydown} />

<div class="max-w-full sm:max-w-[540px]">
	<Button variant="ghost" size="icon" aria-label="Search" onclick={() => (open = true)}>
		<Search class="size-5" />
	</Button>

	<Command.Dialog bind:open shouldFilter={false}>
		<Command.Input
			placeholder="Type a command or search..."
			bind:value={search}
			class="m-2 p-4 text-base leading-normal focus:outline-hidden"
		/>
		<Command.List>
			{#if !loading && !searched}
				<Command.Empty>No results found.</Command.Empty>
			{/if}

			{#if loading}
				<Command.Empty class="py-2 text-center text-sm">Loading...</Command.Empty>
			{/if}

			{#if !loading && searched && results.length === 0}
				<Command.Empty class="py-2 text-center text-sm">No results found.</Command.Empty>
			{/if}

			{#if results.length > 0}
				<Command.Group heading="Search Results">
					{#each results as result}
						<Command.LinkItem
							onSelect={() => (open = false)}
							class="flex items-start gap-4 px-2 py-3"
							href={result.link}
						>
							<Badge variant="default">{result.type}</Badge>
							<div class="ml-2 w-full">
								<p class="text-base font-medium">{result.title}</p>
								<p class="mt-1 line-clamp-2 text-sm">{result.description}</p>
							</div>
						</Command.LinkItem>
					{/each}
				</Command.Group>
			{/if}
		</Command.List>
	</Command.Dialog>
</div>
