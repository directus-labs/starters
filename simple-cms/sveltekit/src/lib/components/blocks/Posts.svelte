<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fetchPaginatedPosts, fetchTotalPostCount } from '$lib/directus/fetchers';
	import type { Post } from '$lib/types/directus-schema';
	import DirectusImage from '../shared/DirectusImage.svelte';
	import Headline from '../ui/Headline.svelte';
	import Tagline from '../ui/Tagline.svelte';

	interface PostsProps {
		data: {
			tagline: string;
			headline?: string;
			posts: Post[];
			limit: number;
		};
	}

	let { data }: PostsProps = $props();
	let { tagline, headline, posts, limit } = $derived(data);
	let visiblePages = $state(5);
	let initialPage = $state(Number(page.url.searchParams.get('page')) || 1);
	// svelte-ignore state_referenced_locally
	let perPage = $state(limit || 6);
	let currentPage = $state(initialPage);
	// svelte-ignore state_referenced_locally
	let paginatedPosts = $state<Post[]>(currentPage === 1 ? posts : []);
	let totalPages = $state(0);

	const fetchTotalPages = async () => {
		try {
			const totalCount = await fetchTotalPostCount();
			totalPages = Math.ceil(totalCount / perPage);
		} catch (error) {
			console.error('Error fetching total post count:', error);
		}
	};
	$effect(() => {
		fetchTotalPages();
	});

	const fetchPosts = async () => {
		try {
			if (currentPage === 1) {
				paginatedPosts = posts;

				return;
			}

			const response = await fetchPaginatedPosts(perPage, currentPage);
			paginatedPosts = response;
		} catch (error) {
			console.error('Error fetching paginated posts:', error);
		}
	};
	$effect(() => {
		fetchPosts();
	});

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			goto(`?page=${page}`, { noScroll: true });
		}
	};

	const generatePagination = () => {
		const pages: (number | string)[] = [];
		if (totalPages <= visiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			const rangeStart = Math.max(1, currentPage - 2);
			const rangeEnd = Math.min(totalPages, currentPage + 2);

			if (rangeStart > 1) {
				pages.push('ellipsis-start');
			}

			for (let i = rangeStart; i <= rangeEnd; i++) {
				pages.push(i);
			}

			if (rangeEnd < totalPages) {
				pages.push('ellipsis-end');
			}
		}

		return pages;
	};

	const paginationLinks = $state(generatePagination());
</script>

<div>
	<Tagline {tagline} />
	{#if headline}
		<Headline {headline} />
	{/if}

	<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
		{#each posts as post}
			<a href={`/blog/${post.slug}`} class="group block overflow-hidden rounded-lg">
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
</div>
