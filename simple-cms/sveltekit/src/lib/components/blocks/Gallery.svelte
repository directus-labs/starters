<script lang="ts">
	import DirectusImage from '../shared/DirectusImage.svelte';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogOverlay,
		DialogTitle
	} from '../ui/dialog';

	import { ArrowLeft, ArrowRight, ZoomIn, X } from 'lucide-svelte';
	import Headline from '../ui/Headline.svelte';
	import Title from '../ui/Title.svelte';

	interface GalleryProps {
		data: {
			title?: string;
			headline?: string;
			items: Array<{
				id: string;
				directus_file: string;
				sort?: number;
			}>;
		};
	}

	let { data }: GalleryProps = $props();
	const { title, headline, items = [] } = $derived(data);
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
	{#if title}
		<Title {title} />
	{/if}
	{#if headline}
		<Headline {headline} />
	{/if}

	{#if sortedItems.length > 0}
		<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
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
						<ZoomIn className="size-10 text-gray-800" />
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
				class="flex items-center justify-center border-none bg-transparent p-2"
				style={{ maxHeight: '90vh' }}
			>
				<DialogTitle class="sr-only">Gallery Image</DialogTitle>
				<DialogDescription class="sr-only">
					Viewing image {currentIndex + 1} of {sortedItems.length}.
				</DialogDescription>

				<div class="relative w-full max-w-4xl">
					<DirectusImage
						uuid={sortedItems[currentIndex].directus_file}
						alt={`Gallery item ${sortedItems[currentIndex].id}`}
						width={1200}
						height={800}
						className="w-full h-auto max-h-full object-contain"
					/>
				</div>

				<button
					class="absolute -left-16 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-70 p-3 text-white hover:bg-opacity-90"
					onclick={handlePrev}
					aria-label="Previous"
				>
					<ArrowLeft className="size-8" />
				</button>
				<button
					class="absolute -right-16 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-70 p-3 text-white hover:bg-opacity-90"
					onclick={handleNext}
					aria-label="Next"
				>
					<ArrowRight className="size-8" />
				</button>
			</DialogContent>
		</Dialog>
	{/if}
</section>
