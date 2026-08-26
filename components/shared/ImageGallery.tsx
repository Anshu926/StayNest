"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        No photos available
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  // If we have multiple images, show thumbnails on right (up to 3 side photos)
  const sideThumbnails = images.length > 1 ? images.slice(1, 4) : [];

  return (
    <>
      {/* Main gallery grid matching 1-large + 3-side layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-72 sm:h-80 md:h-[400px] rounded-2xl overflow-hidden bg-gray-900 shadow-card">
        
        {/* Main large display */}
        <div
          className="relative md:col-span-3 cursor-pointer group overflow-hidden bg-black"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={images[current]}
            alt={`${alt} - photo ${current + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
            unoptimized={images[current]?.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click to Expand</span>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                suppressHydrationWarning
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
            {current + 1} / {images.length}
          </div>
        </div>

        {/* 3 Stacked Side Thumbnails (Desktop layout) */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2.5">
            {images.slice(0, 4).map((img, i) => {
              const isSelected = i === current;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex-1 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group",
                    isSelected
                      ? "border-primary-500 ring-2 ring-primary-500/40 opacity-100"
                      : "border-transparent opacity-75 hover:opacity-100 hover:border-gray-400"
                  )}
                  onClick={() => setCurrent(i)}
                >
                  <Image
                    src={img}
                    alt={`${alt} thumbnail ${i + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized={img?.startsWith("data:")}
                  />
                  {images.length > 4 && i === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                      +{images.length - 4} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-5xl h-[85vh] p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={images[current]}
                alt={`${alt} full view`}
                fill
                className="object-contain"
                unoptimized={images[current]?.startsWith("data:")}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full border border-white/10">
            {current + 1} of {images.length}
          </div>
        </div>
      )}
    </>
  );
}
