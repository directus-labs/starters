<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRouter, useRoute } from '#app';

import DirectusImage from '~/components/shared/DirectusImage.vue';

import PaginationEllipsis from '~/components/ui/pagination/PaginationEllipsis.vue';
import PaginationNext from '~/components/ui/pagination/PaginationNext.vue';
import PaginationPrevious from '~/components/ui/pagination/PaginationPrev.vue';
import PaginationFirst from '~/components/ui/pagination/PaginationFirst.vue';
import PaginationLast from '~/components/ui/pagination/PaginationLast.vue';

interface Post {
	id: string;
	title: string;
	description?: string;
	slug: string;
	image?: string | { id: string };
}

interface PostsProps {
	data: {
		tagline?: string;
		headline?: string;
		posts: Post[];
		limit: number;
	};
}

const props = defineProps<PostsProps>();
const { tagline, headline, posts, limit } = props.data;

const router = useRouter();
const route = useRoute();

const currentPage = ref<number>(Number(route.query.page) || 1);
const paginatedPosts = ref<Post[]>(currentPage.value === 1 ? posts : []);
const totalPages = ref<number>(0);
const visiblePages = 5;

// Fetch total post count and calculate total pages
const fetchTotalPages = async () => {
	const response = await $fetch('/api/post-data', { params: { total: true } });
	totalPages.value = Math.ceil((response.total || 0) / limit);
};

const fetchPaginatedPosts = async (page: number) => {
	const response = await $fetch<Post[]>('/api/post-data', {
		params: { page, limit },
	});
	paginatedPosts.value = response;
};

const generatePagination = computed(() => {
	const pages: (number | string)[] = [];

	if (totalPages.value <= visiblePages) {
		for (let i = 1; i <= totalPages.value; i++) {
			pages.push(i);
		}
	} else {
		const rangeStart = Math.max(1, currentPage.value - 2);
		const rangeEnd = Math.min(totalPages.value, currentPage.value + 2);

		if (rangeStart > 1) {
			pages.push('ellipsis-start');
		}

		for (let i = rangeStart; i <= rangeEnd; i++) {
			pages.push(i);
		}

		if (rangeEnd < totalPages.value) {
			pages.push('ellipsis-end');
		}
	}

	return pages;
});

watchEffect(() => {
	if (currentPage.value > 1) {
		fetchPaginatedPosts(currentPage.value);
	} else {
		paginatedPosts.value = posts;
	}
});

const handlePageChange = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
		router.push({ query: { ...route.query, page } });
	}
};

await fetchTotalPages();
</script>

<template>
	<div>
		<Tagline v-if="tagline" :tagline="tagline" />
		<Headline v-if="headline" :headline="headline" />

		<!-- Posts Grid -->
		<div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
			<template v-if="paginatedPosts.length > 0">
				<div v-for="post in paginatedPosts" :key="post.id" class="group block overflow-hidden rounded-lg">
					<router-link :to="`/blog/${post.slug}`">
						<div class="relative w-full h-64 rounded-lg overflow-hidden">
							<DirectusImage
								v-if="post.image"
								:uuid="typeof post.image === 'string' ? post.image : post.image.id"
								:alt="post.title"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
								class="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							/>
						</div>
						<div class="p-4">
							<h3 class="text-xl group-hover:text-accent font-heading transition-colors duration-300">
								{{ post.title }}
							</h3>
							<p v-if="post.description" class="text-sm text-foreground mt-2">
								{{ post.description }}
							</p>
						</div>
					</router-link>
				</div>
			</template>
			<p v-else class="text-center text-gray-500">No posts available.</p>
		</div>

		<!-- Pagination -->
		<Pagination v-if="totalPages > 1">
			<PaginationFirst v-if="totalPages > visiblePages && currentPage > 1" @click.prevent="handlePageChange(1)" />
			<PaginationPrevious v-if="currentPage > 1" @click.prevent="handlePageChange(currentPage - 1)" />
			<PaginationEllipsis v-for="page in generatePagination" v-if="typeof page === 'string'" :key="page" />
			<button
				v-for="page in generatePagination"
				v-if="typeof page === 'number'"
				:key="page"
				:class="{ 'text-accent font-bold': currentPage === page }"
				@click.prevent="handlePageChange(page)"
			>
				{{ page }}
			</button>
			<PaginationNext v-if="currentPage < totalPages" @click.prevent="handlePageChange(currentPage + 1)" />
			<PaginationLast
				v-if="totalPages > visiblePages && currentPage < totalPages"
				@click.prevent="handlePageChange(totalPages)"
			/>
		</Pagination>
	</div>
</template>
