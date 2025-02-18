<script lang="ts">
	import DirectusImage from '../shared/DirectusImage.svelte';
	import { Title } from '../ui/dialog';
	import Headline from '../ui/Headline.svelte';

	interface PostsProps {
		data: {
			title?: string;
			headline?: string;
			posts: Array<{
				id: string;
				title: string;
				description: string;
				slug: string;
				image?: string;
			}>;
		};
	}

	const { data }: PostsProps = $props();
	const { title, headline, posts } = $derived(data);
</script>

{#if posts && posts.length > 0}
	<div class="py-12">
		{#if title}
			<Title {title} />
		{/if}
		{#if headline}
			<Headline {headline} />
		{/if}

		<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
			{#each posts as post}
				<a href={`/blog/${post.slug}`} class="group block overflow-hidden rounded-lg">
					<div class="relative h-64 w-full overflow-hidden rounded-lg">
						{#if post.image}
							<DirectusImage
								id={post.image}
								alt={post.title}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							/>
						{/if}
					</div>

					<div class="p-4">
						<h3 class="text-lg font-bold transition-colors duration-300 group-hover:text-accent">
							{post.title}
						</h3>
						<p class="mt-2 text-sm text-foreground">{post.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
{/if}
