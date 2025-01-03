'use client';

import { useState } from 'react';
import DirectusImage from '@/components/shared/DirectusImage';
import Tagline from '../ui/Tagline';
import Headline from '@/components/ui/Headline';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, ZoomIn, X } from 'lucide-react';

interface GalleryProps {
	data: {
		tagline?: string;
		headline?: string;
		items: Array<{
			id: string;
			directus_file: string;
			sort?: number;
		}>;
	};
}

const Gallery = ({ data }: GalleryProps) => {
	const { tagline, headline, items = [] } = data;
	const [isLightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const sortedItems = [...items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

	const isValidIndex = sortedItems.length > 0 && currentIndex >= 0 && currentIndex < sortedItems.length;

	const handleOpenLightbox = (index: number) => {
		setCurrentIndex(index);
		setLightboxOpen(true);
	};

	const handlePrev = () => {
		setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : sortedItems.length - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex < sortedItems.length - 1 ? prevIndex + 1 : 0));
	};

	return (
		<section className="">
			{tagline && <Tagline tagline={tagline} />}
			{headline && <Headline headline={headline} />}

			{sortedItems.length > 0 && (
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{sortedItems.map((item, index) => (
						<div
							key={item.id}
							className="relative overflow-hidden rounded-lg group hover:shadow-lg transition-shadow duration-300 cursor-pointer h-[300px]"
							onClick={() => handleOpenLightbox(index)}
							aria-label={`Gallery item ${item.id}`}
						>
							<DirectusImage
								uuid={item.directus_file}
								alt={`Gallery item ${item.id}`}
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className="w-full h-auto object-cover rounded-lg"
							/>
							<div className="absolute inset-0 bg-white bg-opacity-60 opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity duration-300">
								<ZoomIn className="size-10 text-gray-800" />
							</div>
						</div>
					))}
				</div>
			)}

			{/* Lightbox */}
			{isLightboxOpen && isValidIndex && (
				<Dialog open={isLightboxOpen} onOpenChange={setLightboxOpen}>
					<DialogOverlay className="fixed inset-0 bg-black bg-opacity-30 z-50" />
					<DialogContent
						className="flex bg-transparent border-none items-center justify-center p-2"
						style={{ maxHeight: '90vh' }}
					>
						<DialogTitle className="sr-only">Gallery Image</DialogTitle>
						<DialogDescription className="sr-only">
							Viewing image {currentIndex + 1} of {sortedItems.length}.
						</DialogDescription>

						<div className="relative max-w-4xl w-full">
							<DirectusImage
								uuid={sortedItems[currentIndex].directus_file}
								alt={`Gallery item ${sortedItems[currentIndex].id}`}
								width="1200"
								height="800"
								className="w-full h-auto max-h-full object-contain"
							/>
						</div>

						<button
							className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90"
							onClick={handlePrev}
							aria-label="Previous"
						>
							<ArrowLeft className="size-8" />
						</button>
						<button
							className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90"
							onClick={handleNext}
							aria-label="Next"
						>
							<ArrowRight className="size-8" />
						</button>
					</DialogContent>
				</Dialog>
			)}
		</section>
	);
};

export default Gallery;
