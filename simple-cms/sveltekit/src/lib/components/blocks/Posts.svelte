<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fetchPaginatedPosts, fetchTotalPostCount } from '$lib/directus/fetchers';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	import setAttr from '$lib/directus/visualEditing';
	import type { Post } from '$lib/types/directus-schema';
	import DirectusImage from '../shared/DirectusImage.svelte';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';
	import { crossfade, fade, fly, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	interface PostsProps {
		data: {
			tagline: string;
			headline?: string;
			posts: Post[];
			limit: number;
			id: string;
		};
	}

	let { data }: PostsProps = $props();
	let { tagline, headline, posts, limit, id } = $derived(data);
	let visiblePages = $state(5);
	let initialPage = $state(Number(page.url.searchParams.get('page')) || 1);

	let currentPage = $state(initialPage);
	let perPage = $derived(limit || 6);
	// svelte-ignore state_referenced_locally
	let paginatedPosts = $state<Post[]>(currentPage === 1 ? posts : []);
	let totalPages = $state(0);
	let totalCount = $state(0);

	const fetchTotalPages = async () => {
		try {
			totalCount = await fetchTotalPostCount();
			totalPages = Math.ceil(totalCount / perPage);
		} catch (error) {
			console.error('Error fetching total post count:', error);
		}
	};
	$effect(() => {
		fetchTotalPages();
	});

	const fetchPosts = async (currentPage: number) => {
		try {
			if (currentPage === 1) {
				paginatedPosts = posts;

				return;
			}

			paginatedPosts = await fetchPaginatedPosts(perPage, currentPage);
		} catch (error) {
			console.error('Error fetching paginated posts:', error);
		}
	};
	$effect(() => {
		fetchPosts(currentPage);
	});

	const handlePageChange = (page: number) => {
		console.log('handlePageChange', page);
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			fetchPosts(currentPage);
		}
	};
</script>

<div>
	<Tagline
		{tagline}
		data-directus={setAttr({
			collection: 'block_posts',
			item: id,
			fields: 'tagline',
			mode: 'popover'
		})}
	/>
	{#if headline}
		<Headline
			{headline}
			data-directus={setAttr({
				collection: 'block_posts',
				item: id,
				fields: 'headline',
				mode: 'popover'
			})}
		/>
	{/if}

	<div
		class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
		data-directus={setAttr({
			collection: 'block_posts',
			item: id,
			fields: ['collection', 'limit'],
			mode: 'popover'
		})}
	>
		{#each paginatedPosts as post (post.id)}
			<a
				in:scale={{ duration: 100 }}
				href={`/blog/${post.slug}`}
				class="group block overflow-hidden rounded-lg"
			>
				<div class="relative h-64 w-full overflow-hidden rounded-lg">
					{#if post.image}
						<DirectusImage
							uuid={post.image}
							alt={post.title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
							class="h-auto w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
						/>
					{/if}
				</div>

				<div class="p-4">
					<h3 class="font-heading text-xl transition-colors duration-300 group-hover:text-accent">
						{post.title}
					</h3>
					<p class="mt-2 text-sm text-foreground">{post.description}</p>
				</div>
			</a>
		{/each}
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<Pagination.Root count={totalCount} perPage={limit} onPageChange={handlePageChange}>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<!-- <Pagination.Item>
						<Pagination.PrevButton />
					</Pagination.Item> -->
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link {page} isActive={currentPage === page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<!-- <Pagination.Item>
						<Pagination.NextButton />
					</Pagination.Item> -->
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	{/if}
</div>
