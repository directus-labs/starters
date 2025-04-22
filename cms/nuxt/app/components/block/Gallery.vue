<script setup lang="ts">
import { ZoomIn, ArrowLeft, ArrowRight, X } from 'lucide-vue-next';

interface GalleryItem {
	id: string;
	directus_file: string;
	sort?: number;
}

interface GalleryProps {
	data: {
		id: string;
		tagline?: string;
		headline?: string;
		items: GalleryItem[];
	};
}

const props = defineProps<GalleryProps>();

const isLightboxOpen = ref(false);
const currentIndex = ref(0);

const sortedItems = computed(() => {
	if (!props.data.items) return [];
	return [...props.data.items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});

const currentItem = computed(() => {
	if (!sortedItems.value.length || currentIndex.value < 0 || currentIndex.value >= sortedItems.value.length) {
		return null;
	}

	return sortedItems.value[currentIndex.value];
});

function handleOpenLightbox(index: number) {
	if (index >= 0 && index < sortedItems.value.length) {
		currentIndex.value = index;
		isLightboxOpen.value = true;
	}
}

function handlePrev() {
	if (!sortedItems.value.length) return;
	currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : sortedItems.value.length - 1;
}

function handleNext() {
	if (!sortedItems.value.length) return;
	currentIndex.value = currentIndex.value < sortedItems.value.length - 1 ? currentIndex.value + 1 : 0;
}

function handleKeyDown(e: KeyboardEvent) {
	if (!isLightboxOpen.value) return;
	e.preventDefault();
	e.stopPropagation();

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

const { setAttr } = useVisualEditing();

onMounted(() => {
	window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
	<section class="relative">
		<Tagline
			v-if="data.tagline"
			:tagline="data.tagline"
			:data-directus="setAttr({ collection: 'block_gallery', item: data.id, fields: 'tagline', mode: 'popover' })"
		/>
		<Headline
			v-if="data.headline"
			:headline="data.headline"
			:data-directus="setAttr({ collection: 'block_gallery', item: data.id, fields: 'headline', mode: 'popover' })"
		/>

		<div
			v-if="sortedItems.length"
			class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
			:data-directus="setAttr({ collection: 'block_gallery', item: data.id, fields: 'items', mode: 'modal' })"
		>
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

		<Dialog v-model:open="isLightboxOpen">
			<DialogContent
				class="flex max-w-full max-h-full items-center justify-center p-2 bg-transparent border-none z-50"
				hideCloseButton
			>
				<DialogTitle class="sr-only">Gallery Image</DialogTitle>
				<DialogDescription class="sr-only">
					Viewing image {{ currentIndex + 1 }} of {{ sortedItems.length }}.
				</DialogDescription>
				<DialogHeader />

				<div class="relative w-[90vw] h-[90vh] flex items-center justify-center">
					<DirectusImage
						v-if="currentItem"
						:uuid="currentItem.directus_file"
						:alt="`Gallery item ${currentItem.id}`"
						class="size-full object-contain"
					/>
				</div>

				<div v-if="sortedItems.length > 1" class="absolute bottom-4 inset-x-0 flex justify-between px-4">
					<button
						class="flex items-center gap-2 text-white bg-black bg-opacity-70 rounded-full px-4 py-2 hover:bg-opacity-90"
						@click="handlePrev"
					>
						<ArrowLeft class="w-8 h-8" />
						<span>Prev</span>
					</button>
					<button
						class="flex items-center gap-2 text-white bg-black bg-opacity-70 rounded-full px-4 py-2 hover:bg-opacity-90"
						@click="handleNext"
					>
						<span>Next</span>
						<ArrowRight class="w-8 h-8" />
					</button>
				</div>
				<DialogClose asChild>
					<button
						class="absolute top-4 right-4 bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
						aria-label="Close Lightbox"
					>
						<X class="w-8 h-8" />
					</button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	</section>
</template>
