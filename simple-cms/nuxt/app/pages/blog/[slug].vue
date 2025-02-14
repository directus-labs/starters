<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute, useAsyncData, useRuntimeConfig, usePreviewMode } from 'nuxt/app';
import DirectusImage from '~/components/shared/DirectusImage.vue';
import Separator from '~/components/ui/separator/Separator.vue';

const route = useRoute();
const slug = route.params.slug as string;

const { enabled } = usePreviewMode();

const { data: post, refresh } = await useAsyncData<Post>(`post-${slug}`, () =>
	$fetch<Post>(`/api/posts/${slug}`, {
		query: { preview: enabled.value },
	}),
);

watchEffect(() => {
	if (enabled.value) refresh();
});

const { data: relatedPosts } = await useAsyncData<Post[]>(`related-${slug}`, () =>
	$fetch<Post[]>(`/api/posts/${slug}/related`),
);

const { data: author } = await useAsyncData<DirectusUser | null>(`author-${post.value?.author}`, () =>
	$fetch<DirectusUser>(`/api/users/${post.value?.author}`),
);

const postUrl = `${useRuntimeConfig().public.siteUrl}/blog/${slug}`;

const authorName = computed(() => {
	if (!author.value) return '';
	return [author.value.first_name, author.value.last_name].filter(Boolean).join(' ');
});

const authorAvatar = computed(() => {
	if (!author.value?.avatar) return null;
	return typeof author.value.avatar === 'string' ? author.value.avatar : author.value.avatar.id;
});
</script>
<template>
	<div v-if="post">
		<Container class="py-12">
			<p v-if="enabled">(Draft Mode)</p>

			<div v-if="post.image" class="mb-8 w-full">
				<div class="relative w-full h-[400px] md:h-[500px] overflow-hidden">
					<DirectusImage
						:uuid="post.image as string"
						:alt="post.title || 'post header image'"
						class="object-cover w-full h-full"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
						fill
					/>
				</div>
			</div>

			<Headline :headline="post.title" as="h2" class="!text-accent mb-4" />
			<div class="w-full">
				<Separator class="h-[1px] bg-gray-300 my-8" />
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,_2fr)_400px] gap-12">
				<main class="text-left">
					<Text :content="post.content || ''" />
				</main>

				<aside class="space-y-6 p-6 rounded-lg max-w-[496px] h-fit bg-background-muted">
					<div v-if="author" class="flex items-center space-x-4">
						<DirectusImage
							v-if="authorAvatar"
							:uuid="authorAvatar"
							:alt="authorName || 'author avatar'"
							class="rounded-full object-cover size-[48px]"
							:width="48"
							:height="48"
						/>
						<div>
							<p v-if="authorName" class="font-bold">{{ authorName }}</p>
						</div>
					</div>

					<p v-if="post.description">{{ post.description }}</p>

					<div class="flex justify-start">
						<ShareDialog :post-url="postUrl" :post-title="post.title" />
					</div>
					<div>
						<Separator class="h-[1px] bg-gray-300 my-4" />
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
