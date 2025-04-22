<script lang="ts">
	import DirectusImage from '../shared/DirectusImage.svelte';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogDescription,
		DialogOverlay,
		DialogTitle
	} from '../ui/dialog';

	import { ArrowLeft, ArrowRight, ZoomIn, X } from 'lucide-svelte';
	import Headline from '../ui/Headline.svelte';
	import Title from '../ui/Title.svelte';
	import Tagline from '../ui/Tagline.svelte';
	import setAttr from '$lib/directus/visualEditing';

	interface GalleryProps {
		data: {
			id: string;
			tagline?: string;
			headline?: string;
			items: Array<{
				id: string;
				directus_file: string;
				sort?: number;
			}>;
		};
	}

	let { data }: GalleryProps = $props();
	const { tagline, headline, items = [], id } = $derived(data);
	let isLightboxOpen = $state(false);
	let currentIndex = $state(0);

	let sortedItems = $derived([...items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)));
	const isValidIndex = $derived(
		sortedItems.length > 0 && currentIndex >= 0 && currentIndex < sortedItems.length
	);

	const handleOpenLightbox = (index: number) => {
		currentIndex = index;
		isLightboxOpen = true;
	};
	const handlePrev = () => {
		if (currentIndex > 0) {
			currentIndex--;
		}

		// setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : sortedItems.length - 1));
	};

	const handleNext = () => {
		if (currentIndex < sortedItems.length - 1) {
			currentIndex++;
		} else {
			currentIndex = 0;
		}
		// setCurrentIndex((prevIndex) => (prevIndex < sortedItems.length - 1 ? prevIndex + 1 : 0));
	};
</script>

<section class="p-6">
	{#if tagline}
		<Tagline
			{tagline}
			data-directus={setAttr({
				collection: 'block_gallery',
				item: id,
				fields: 'tagline',
				mode: 'popover'
			})}
		/>
	{/if}
	{#if headline}
		<Headline
			{headline}
			data-directus={setAttr({
				collection: 'block_gallery',
				item: id,
				fields: 'headline',
				mode: 'popover'
			})}
		/>
	{/if}

	{#if sortedItems.length > 0}
		<div
			class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
			data-directus={setAttr({
				collection: 'block_gallery',
				item: id,
				fields: 'items',
				mode: 'modal'
			})}
		>
			{#each sortedItems as item, index}
				<button
					class="group relative h-[300px] overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-lg"
					onclick={() => handleOpenLightbox(index)}
					aria-label={`Gallery item ${item.id}`}
				>
					<DirectusImage
						uuid={item.directus_file}
						alt={`Gallery item ${item.id}`}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
						class="h-auto w-full rounded-lg object-cover"
					/>
					<div
						class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						<ZoomIn class="size-10 text-gray-800" />
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- {/* Lightbox */} -->
	{#if isLightboxOpen && isValidIndex}
		<Dialog open={isLightboxOpen} onOpenChange={() => (isLightboxOpen = false)}>
			<DialogOverlay class="fixed inset-0 z-50 bg-black bg-opacity-30" />
			<DialogContent
				class="z-50 flex max-h-full max-w-full items-center  justify-center border-none bg-transparent p-2"
			>
				<DialogTitle class="sr-only">Gallery Image</DialogTitle>
				<DialogDescription class="sr-only">
					Viewing image {currentIndex + 1} of {sortedItems.length}.
				</DialogDescription>

				<div class="relative flex h-[90vh] w-[90vw] items-center justify-center">
					<DirectusImage
						uuid={sortedItems[currentIndex].directus_file}
						alt={`Gallery item ${sortedItems[currentIndex].id}`}
						width={1200}
						height={800}
						class="h-auto max-h-full w-full object-contain"
					/>
				</div>

				<div class="absolute inset-x-0 bottom-4 flex items-center justify-between px-4">
					<button
						class="flex items-center gap-2 rounded-full bg-black bg-opacity-70 px-4 py-2 text-white hover:bg-opacity-90"
						onclick={handlePrev}
						aria-label="Previous"
					>
						<ArrowLeft class="size-8" />
						<span>Prev</span>
					</button>
					<button
						class="flex items-center gap-2 rounded-full bg-black bg-opacity-70 px-4 py-2 text-white hover:bg-opacity-90"
						onclick={handleNext}
						aria-label="Next"
					>
						<span>Next</span>
						<ArrowRight class="size-8" />
					</button>
				</div>
				<DialogClose>
					<button
						class="absolute right-4 top-4 rounded-full bg-black bg-opacity-70 p-2 text-white hover:bg-opacity-90"
						aria-label="Close"
					>
						<X class="size-8" />
					</button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	{/if}
</section>
