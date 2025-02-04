<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';

import {
	Pagination,
	PaginationListItem,
	PaginationEllipsis,
	PaginationFirst,
	PaginationLast,
	PaginationNext,
	PaginationPrev,
} from '~/components/ui/pagination';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface Post {
	id: string;
	title: string;
	slug: string;
	description?: string;
	image?: string;
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

const route = useRoute();
const router = useRouter();

const perPage = props.data.limit || 6;
const currentPage = ref(Number(route.query.page) || 1);
const paginatedPosts = ref<Post[]>(currentPage.value === 1 ? props.data.posts : []);
const totalPages = ref(0);
const fetchError = ref<string | null>(null);

const fetchTotalPages = async () => {
	try {
		const data = await $fetch<{ total: number }>('/api/posts/count');
		totalPages.value = Math.ceil((data.total || 0) / perPage);
		await nextTick();
	} catch {
		fetchError.value = 'Failed to load total post count.';
	}
};

const fetchPosts = async () => {
	if (currentPage.value === 1) {
		paginatedPosts.value = props.data.posts;
		return;
	}

	try {
		const data = await $fetch<Post[]>('/api/posts/', {
			query: { page: currentPage.value, limit: perPage },
		});
		paginatedPosts.value = data || [];
	} catch {
		fetchError.value = 'Failed to load posts.';
	}
};

const handlePageChange = (page: number) => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
		router.push({ query: { page } });
	}
};

const visiblePages = 5;
const paginationLinks = computed(() => {
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

watch(currentPage, fetchPosts);
watch(totalPages, () => {
	if (totalPages.value > 1) {
		fetchPosts();
	}
});

onMounted(async () => {
	await Promise.all([fetchTotalPages(), fetchPosts()]);
});
</script>
<template>
	<div>
		<!-- Headline / Tagline sections -->
		<Tagline v-if="data.tagline" :tagline="data.tagline" />
		<Headline v-if="data.headline" :headline="data.headline" />

		<p v-if="fetchError" class="text-center text-red-500">{{ fetchError }}</p>

		<!-- Posts grid -->
		<div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
			<template v-if="paginatedPosts.length">
				<NuxtLink
					v-for="post in paginatedPosts"
					:key="post.id"
					:to="`/blog/${post.slug}`"
					class="group block overflow-hidden rounded-lg"
				>
					<!-- Ensuring all images are the same size -->
					<div class="relative w-full h-[256px] overflow-hidden rounded-lg">
						<DirectusImage
							v-if="post.image"
							:uuid="post.image"
							:alt="post.title"
							class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
				</NuxtLink>
			</template>
			<p v-else class="text-center text-gray-500">No posts available.</p>
		</div>
		<Pagination v-if="totalPages > 1" class="mt-6">
			<div class="flex items-center justify-center space-x-2">
				<div v-if="totalPages > 5 && currentPage > 1" class="flex items-center">
					<PaginationFirst @click="handlePageChange(1)">
						<ChevronsLeft class="h-4 w-4" />
					</PaginationFirst>
					<PaginationPrev @click="handlePageChange(currentPage - 1)">
						<ChevronLeft class="h-4 w-4" />
					</PaginationPrev>
				</div>
				<template v-for="(page, index) in paginationLinks" :key="index">
					<PaginationListItem v-if="typeof page === 'number'" :value="page" @click="handlePageChange(page)">
						<button
							class="w-10 h-10 flex items-center justify-center rounded-md"
							:class="currentPage === page ? 'bg-accent text-white' : 'bg-background'"
						>
							{{ page }}
						</button>
					</PaginationListItem>
					<PaginationEllipsis v-else class="px-2" />
				</template>
				<div v-if="totalPages > 5 && currentPage < totalPages" class="flex items-center">
					<PaginationNext @click="handlePageChange(currentPage + 1)">
						<ChevronRight class="h-4 w-4" />
					</PaginationNext>
					<PaginationLast @click="handlePageChange(totalPages)">
						<ChevronsRight class="h-4 w-4" />
					</PaginationLast>
				</div>
			</div>
		</Pagination>
	</div>
</template>
