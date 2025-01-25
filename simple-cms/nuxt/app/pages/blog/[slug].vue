// pages/blog/[slug].vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchPostBySlug, fetchRelatedPosts, fetchAuthorById } from '~/utils/directus/fetchers';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const post = ref<Post | null>(null);
const relatedPosts = ref<Post[]>([]);
const author = ref<Author | null>(null);

onMounted(async () => {
	try {
		post.value = await fetchPostBySlug(slug.value);

		if (post.value) {
			relatedPosts.value = await fetchRelatedPosts(post.value.id);

			if (post.value.author) {
				author.value = await fetchAuthorById(post.value.author as string);
			}
		}
	} catch (error) {
		console.error('Error fetching post details:', error);
	}
});

const authorName = computed(() => {
	return [author.value?.first_name, author.value?.last_name].filter(Boolean).join(' ');
});

const postUrl = computed(() => `${useRuntimeConfig().public.siteUrl}/blog/${slug.value}`);
</script>

<template>
	<div v-if="post" class="py-12">
		<div v-if="post.image" class="mb-8">
			<nuxt-img
				:src="post.image"
				:alt="post.title || 'Post header image'"
				class="w-full h-[400px] object-cover rounded-lg"
			/>
		</div>

		<h2 class="text-accent mb-4">{{ post.title }}</h2>
		<hr class="mb-8" />

		<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
			<main class="text-left">
				<div v-html="post.content"></div>
			</main>

			<aside class="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
				<div v-if="author" class="flex items-center space-x-4">
					<nuxt-img
						v-if="author.avatar"
						:src="author.avatar"
						:alt="authorName"
						class="rounded-full object-cover size-[48px]"
						width="48"
						height="48"
					/>
					<div>
						<p v-if="authorName" class="font-bold">{{ authorName }}</p>
					</div>
				</div>

				<p v-if="post.description">{{ post.description }}</p>

				<ShareDialog :post-url="postUrl" :post-title="post.title" />

				<hr class="my-4" />

				<h3 class="font-bold mb-4">Related Posts</h3>
				<div class="space-y-4">
					<NuxtLink
						v-for="relatedPost in relatedPosts"
						:key="relatedPost.id"
						:to="`/blog/${relatedPost.slug}`"
						class="flex items-center space-x-4 hover:text-accent group"
					>
						<nuxt-img
							v-if="relatedPost.image"
							:src="relatedPost.image"
							:alt="relatedPost.title"
							class="w-[150px] h-[100px] object-cover rounded-lg transition-transform group-hover:scale-110"
						/>
						<span class="font-heading">{{ relatedPost.title }}</span>
					</NuxtLink>
				</div>
			</aside>
		</div>
	</div>
	<div v-else class="text-center text-xl mt-[20%]">404 - Post Not Found</div>
</template>
