<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useFetch } from 'nuxt/app';
import DirectusImage from '~/components/shared/DirectusImage.vue';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch post data
const { data: post } = await useAsyncData<Post>(`post-${slug}`, () => $fetch(`/api/posts/${slug}`));

// Fetch related posts
const { data: relatedPosts } = await useAsyncData<Post[]>(`related-${slug}`, () =>
	$fetch(`/api/posts/${slug}/related`),
);

// Fetch author details
const { data: author } = await useAsyncData<Author | null>(
	`author-${post.value?.author}`,
	() => (post.value?.author ? $fetch(`/api/authors/${post.value.author}`) : null),
	{ watch: [post] },
);

const postUrl = `${useRuntimeConfig().public.siteUrl}/blog/${slug}`;

const authorName = computed(() => {
	if (!author.value) return '';
	return [author.value.first_name, author.value.last_name].filter(Boolean).join(' ');
});
</script>

<template>
	<div v-if="post">
		<Container class="py-12">
			<div v-if="post.image" class="mb-8">
				<div class="relative w-full h-[400px] overflow-hidden rounded-lg">
					<DirectusImage
						:uuid="post.image as string"
						:alt="post.title || 'post header image'"
						class="object-cover"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
					/>
				</div>
			</div>

			<Headline :headline="post.title" as="h2" class="!text-accent mb-4" />
			<Separator class="mb-8" />

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
				<main class="text-left">
					<Text :content="post.content || ''" />
				</main>

				<aside class="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
					<div v-if="author" class="flex items-center space-x-4">
						<DirectusImage
							v-if="author.avatar"
							:uuid="author.avatar as string"
							:alt="authorName || 'author avatar'"
							class="rounded-full object-cover size-[48px]"
							:width="48"
							:height="48"
						/>
						<div>
							<p v-if="authorName" class="font-bold">{{ authorName }}</p>
						</div>
					</div>

					<p v-if="post.description" class="">{{ post.description }}</p>

					<div class="flex justify-start">
						<ShareDialog :post-url="postUrl" :post-title="post.title" />
					</div>

					<div>
						<Separator class="my-4" />
						<h3 class="font-bold mb-4">Related Posts</h3>
						<div class="space-y-4">
							<NuxtLink
								v-for="relatedPost in relatedPosts"
								:key="relatedPost.id"
								:to="`/blog/${relatedPost.slug}`"
								class="flex items-center space-x-4 hover:text-accent group"
							>
								<div v-if="relatedPost.image" class="relative shrink-0 w-[150px] h-[100px] overflow-hidden rounded-lg">
									<DirectusImage
										:uuid="relatedPost.image as string"
										:alt="relatedPost.title || 'related posts'"
										class="object-cover transition-transform duration-300 group-hover:scale-110"
										fill
										sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 150px"
									/>
								</div>
								<span class="font-heading">{{ relatedPost.title }}</span>
							</NuxtLink>
						</div>
					</div>
				</aside>
			</div>
		</Container>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Post Not Found</div>
</template>
