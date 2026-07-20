"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showArrows, setShowArrows] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current || !zoomed) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      <div
        ref={imageRef}
        onMouseEnter={() => { setZoomed(true); setShowArrows(true); }}
        onMouseLeave={() => { setZoomed(false); setShowArrows(false); }}
        onMouseMove={handleMouseMove}
        className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 cursor-crosshair group"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            style={
              zoomed
                ? {
                    transform: "scale(2)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : {}
            }
          >
            {images[activeIndex] ? (
              <Image
                src={images[activeIndex]}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">No image</div>
            )}
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-700 dark:text-zinc-200 shadow-md transition-opacity duration-200 ${showArrows && !zoomed ? "opacity-100" : "opacity-0 pointer-events-none"} hover:bg-white dark:hover:bg-zinc-800`}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-zinc-700 dark:text-zinc-200 shadow-md transition-opacity duration-200 ${showArrows && !zoomed ? "opacity-100" : "opacity-0 pointer-events-none"} hover:bg-white dark:hover:bg-zinc-800`}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`relative w-16 sm:w-20 h-16 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
              i === activeIndex
                ? "border-primary"
                : "border-transparent hover:border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {img ? (
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">N/A</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
