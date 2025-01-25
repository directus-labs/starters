<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ZoomIn, ArrowLeft, ArrowRight, X } from 'lucide-vue-next';

interface GalleryItem {
	id: string;
	directus_file: string;
	sort?: number;
}

interface GalleryProps {
	data: {
		tagline?: string;
		headline?: string;
		items: GalleryItem[];
	};
}

const props = defineProps<GalleryProps>();

const isLightboxOpen = ref(false);
const currentIndex = ref(0);

const sortedItems = computed(() => {
	if (!props.data?.items) return [];
	return [...props.data.items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});

const handleOpenLightbox = (index: number) => {
	if (index >= 0 && index < sortedItems.value.length) {
		currentIndex.value = index;
		isLightboxOpen.value = true;
	}
};

const handlePrev = () => {
	if (sortedItems.value.length > 0) {
		currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : sortedItems.value.length - 1;
	}
};

const handleNext = () => {
	if (sortedItems.value.length > 0) {
		currentIndex.value = currentIndex.value < sortedItems.value.length - 1 ? currentIndex.value + 1 : 0;
	}
};

const handleKeydown = (e: KeyboardEvent) => {
	if (isLightboxOpen.value) {
		switch (e.key) {
			case 'ArrowLeft':
				handlePrev();
				break;
			case 'ArrowRight':
				handleNext();
				break;
			case 'Escape':
				isLightboxOpen.value = false;
				break;
		}
	}
};

onMounted(() => {
	window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
	<section class="relative">
		<Tagline v-if="props.data.tagline" :tagline="props.data.tagline" />
		<Headline v-if="props.data.headline" :headline="props.data.headline" />

		<div v-if="sortedItems.length" class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
			<div
				v-for="(item, index) in sortedItems"
				:key="item.id"
				class="relative overflow-hidden rounded-lg group hover:shadow-lg transition-shadow duration-300 cursor-pointer h-[300px]"
				@click="handleOpenLightbox(index)"
			>
				<DirectusImage
					:uuid="item.directus_file"
					:alt="`Gallery item ${item.id}`"
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
					class="w-full h-full object-cover rounded-lg"
				/>
				<div
					class="absolute inset-0 bg-white bg-opacity-60 opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity duration-300"
				>
					<ZoomIn class="w-10 h-10 text-gray-800" />
				</div>
			</div>
		</div>

		<ClientOnly>
			<teleport to="body">
				<div
					v-if="isLightboxOpen && sortedItems[currentIndex]"
					class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
				>
					<div class="relative max-w-[90vw] max-h-[90vh]">
						<DirectusImage
							:uuid="sortedItems[currentIndex].directus_file"
							:alt="`Gallery item ${sortedItems[currentIndex].id}`"
							class="max-w-full max-h-full object-contain"
						/>
						<div class="absolute bottom-4 inset-x-0 flex justify-between px-4">
							<button
								class="bg-black bg-opacity-70 text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-opacity-90"
								@click="handlePrev"
							>
								<ArrowLeft class="w-8 h-8" />
								<span>Prev</span>
							</button>
							<button
								class="bg-black bg-opacity-70 text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-opacity-90"
								@click="handleNext"
							>
								<span>Next</span>
								<ArrowRight class="w-8 h-8" />
							</button>
						</div>
						<button
							class="absolute top-4 right-4 bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
							@click="isLightboxOpen = false"
						>
							<X class="w-8 h-8" />
						</button>
					</div>
				</div>
			</teleport>
		</ClientOnly>
	</section>
</template>
