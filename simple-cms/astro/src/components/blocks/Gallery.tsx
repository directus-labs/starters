"use client";

import { useEffect, useState } from "react";
import DirectusImage from "@/components/shared/DirectusImage";
import Tagline from "../ui/Tagline";
import Headline from "@/components/ui/Headline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, ZoomIn, X } from "lucide-react";
import React from "react";

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
  const isValidIndex =
    sortedItems.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < sortedItems.length;

  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : sortedItems.length - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex < sortedItems.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isLightboxOpen) {
      e.stopPropagation();
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : sortedItems.length - 1
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prevIndex) =>
            prevIndex < sortedItems.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case "Escape":
          e.preventDefault();
          setLightboxOpen(false);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <section className="relative">
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
              <div className="relative w-full h-[300px]">
                <DirectusImage
                  uuid={item.directus_file}
                  alt={`Gallery item ${item.id}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="absolute inset-0 bg-white bg-opacity-60 opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity duration-300">
                <ZoomIn className="size-10 text-gray-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isLightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="flex max-w-[95vw] max-h-[95vh] items-center justify-center p-2 bg-black/80 border-none">
          <DialogTitle className="sr-only">Gallery Image</DialogTitle>
          <DialogDescription className="sr-only">
            Viewing image {currentIndex + 1} of {sortedItems.length}
          </DialogDescription>

          {isValidIndex && (
            <div className="relative flex justify-center items-center w-full h-full">
              <DirectusImage
                uuid={sortedItems[currentIndex].directus_file}
                alt={`Gallery item ${sortedItems[currentIndex].id}`}
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
              />

              <div className="absolute bottom-4 inset-x-0 flex justify-between items-center px-4">
                <button
                  className="flex items-center gap-2 text-white bg-black/70 rounded-full px-4 py-2 hover:bg-black/90 transition-colors"
                  onClick={handlePrev}
                  aria-label="Previous image"
                >
                  <ArrowLeft className="size-6" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  className="flex items-center gap-2 text-white bg-black/70 rounded-full px-4 py-2 hover:bg-black/90 transition-colors"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="size-6" />
                </button>
              </div>

              <DialogClose className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors">
                <button
                  className="p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="size-6" />
                </button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
