<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import DirectusImage from '$lib/components/shared/DirectusImage.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Headline from '$lib/components/ui/Headline.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { PageData } from './$types';
	import BaseText from '$lib/components/ui/Text.svelte';
	import ShareDialog from '$lib/components/ui/ShareDialog.svelte';
	import setAttr from '$lib/directus/visualEditing';

	let { data }: { data: PageData } = $props();

	let post = $derived(data.post);
	const author = $derived(data.author);
	const authorName = $derived([author?.first_name, author?.last_name].filter(Boolean).join(' '));
	const postUrl = `${PUBLIC_SITE_URL}/blog/${page.params.slug}`;
</script>

<Container class="py-12">
	{#if post?.image}
		<div class="mb-8">
			<div
				class="relative h-[400px] w-full overflow-hidden rounded-lg"
				data-directus={setAttr({
					collection: 'posts',
					item: post.id,
					fields: ['image', 'meta_header_image'],
					mode: 'modal'
				})}
			>
				<DirectusImage
					uuid={post.image as string}
					alt={post.title || 'post header image'}
					class="object-cover"
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
				/>
			</div>
		</div>
	{/if}
	<Headline
		as="h2"
		headline={post.title}
		class="mb-4 !text-accent"
		data-directus={setAttr({
			collection: 'posts',
			item: post.id,
			fields: ['title', 'slug'],
			mode: 'popover'
		})}
	/>
	<Separator class="mb-8" />

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,_2fr)_400px]">
		<main class="text-left">
			<BaseText
				content={post.content || ''}
				data-directus={setAttr({
					collection: 'posts',
					item: post.id,
					fields: ['content', 'meta_header_content'],
					mode: 'drawer'
				})}
			/>
		</main>

		<aside class="h-fit max-w-[496px] space-y-6 rounded-lg bg-background-muted p-6">
			{#if author}
				<div
					class="flex items-center space-x-4"
					data-directus={setAttr({
						collection: 'posts',
						item: post.id,
						fields: ['author'],
						mode: 'popover'
					})}
				>
					{#if author.avatar}
						<DirectusImage
							uuid={author.avatar as string}
							alt={authorName || 'author avatar'}
							class="size-[48px] rounded-full object-cover"
							width={48}
							height={48}
						/>
					{/if}
					<div>
						{#if authorName}
							<p
								class="font-bold"
								data-directus={setAttr({
									collection: 'posts',
									item: post.id,
									fields: ['author'],
									mode: 'popover'
								})}
							>
								{authorName}
							</p>
						{/if}
					</div>
				</div>
			{/if}

			{#if post.description}
				<p
					data-directus={setAttr({
						collection: 'posts',
						item: post.id,
						fields: 'description',
						mode: 'popover'
					})}
				>
					{post.description}
				</p>
			{/if}

			<div class="flex justify-start">
				<ShareDialog {postUrl} postTitle={post.title} />
			</div>

			<div>
				<Separator class="my-4" />
				<h3 class="mb-4 font-bold">Related Posts</h3>
				<div class="space-y-4">
					{#each data.relatedPosts as relatedPost (relatedPost.id)}
						<a
							href={`/blog/${relatedPost.slug}`}
							class="group flex items-center space-x-4 hover:text-accent"
						>
							{#if relatedPost.image}
								<div class="relative h-[100px] w-[150px] shrink-0 overflow-hidden rounded-lg">
									<DirectusImage
										uuid={relatedPost.image as string}
										alt={relatedPost.title || 'related posts'}
										class="object-cover transition-transform duration-300 group-hover:scale-110"
										fill
										sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
									/>
								</div>
							{/if}
							<span class="font-heading">{relatedPost.title}</span>
						</a>
					{/each}
				</div>
			</div>
		</aside>
	</div>
</Container>
