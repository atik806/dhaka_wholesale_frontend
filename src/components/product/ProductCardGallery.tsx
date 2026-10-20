"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, IMAGE_BLUR_PLACEHOLDER } from "@/src/lib/utils";

interface ProductCardGalleryProps {
  images: string[];
  name: string;
  href: string;
  contain?: boolean;
  muted?: boolean;
  children?: React.ReactNode;
}

export function ProductCardGallery({ images, name, href, contain, muted, children }: ProductCardGalleryProps) {
  const photos = images.length ? images : ["/placeholder.svg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const slidesRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef({ x: 0, dragged: false });
  const hasGallery = photos.length > 1;

  const showImage = (index: number) => {
    const slides = slidesRef.current;
    if (!slides) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slides.scrollTo({ left: index * slides.clientWidth, behavior: reducedMotion ? "instant" : "smooth" });
  };

  const rememberFailure = (src: string) => {
    setFailedImages((previous) => new Set(previous).add(src));
  };

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <div
          ref={slidesRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${name} photos`}
          tabIndex={hasGallery ? 0 : -1}
          onKeyDown={(event) => {
            if (!hasGallery || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            showImage((activeIndex + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length);
          }}
          onPointerDown={(event) => { gestureRef.current = { x: event.clientX, dragged: false }; }}
          onPointerMove={(event) => {
            if (Math.abs(event.clientX - gestureRef.current.x) > 8) gestureRef.current.dragged = true;
          }}
          onClickCapture={(event) => {
            if (event.detail > 0 && gestureRef.current.dragged) event.preventDefault();
          }}
          onScroll={(event) => {
            const slides = event.currentTarget;
            const index = Math.max(0, Math.min(photos.length - 1, Math.round(slides.scrollLeft / slides.clientWidth)));
            setActiveIndex(index);
            const strip = thumbnailsRef.current;
            const thumbnail = strip?.children[index] as HTMLElement | undefined;
            if (strip && thumbnail) {
              if (thumbnail.offsetLeft < strip.scrollLeft) strip.scrollLeft = thumbnail.offsetLeft;
              else if (thumbnail.offsetLeft + thumbnail.offsetWidth > strip.scrollLeft + strip.clientWidth) {
                strip.scrollLeft = thumbnail.offsetLeft + thumbnail.offsetWidth - strip.clientWidth;
              }
            }
          }}
          className="scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          {photos.map((src, index) => (
            <Link
              key={`${src}-${index}`}
              href={href}
              tabIndex={index === activeIndex ? 0 : -1}
              aria-label={`View ${name}, photo ${index + 1} of ${photos.length}`}
              draggable={false}
              className="relative block h-full w-full shrink-0 snap-center snap-always"
            >
              <Image
                src={failedImages.has(src) ? "/placeholder.svg" : src}
                alt={`${name} — photo ${index + 1}`}
                fill
                draggable={false}
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={cn(contain ? "object-contain p-3" : "object-cover", muted && "opacity-60")}
                onError={() => rememberFailure(src)}
              />
            </Link>
          ))}
        </div>

        {children}

        {hasGallery && (
          <>
            <button
              type="button"
              aria-label={`Previous photo of ${name}`}
              onClick={() => showImage((activeIndex - 1 + photos.length) % photos.length)}
              className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/95 text-fg shadow-sm transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Next photo of ${name}`}
              onClick={() => showImage((activeIndex + 1) % photos.length)}
              className="absolute right-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/95 text-fg shadow-sm transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span aria-live="polite" aria-atomic="true" className="pointer-events-none absolute bottom-2 right-2 rounded-md border border-line bg-surface/95 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
              {activeIndex + 1} / {photos.length}
            </span>
          </>
        )}
      </div>

      {hasGallery && (
        <div ref={thumbnailsRef} aria-label={`${name} thumbnails`} className="scrollbar-none relative flex gap-1.5 overflow-x-auto overscroll-x-contain border-b border-line p-2">
          {photos.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`Show photo ${index + 1} of ${name}`}
              aria-pressed={activeIndex === index}
              onClick={() => showImage(index)}
              className={cn(
                "relative h-11 w-11 shrink-0 overflow-hidden rounded-md border-2 bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent sm:h-12 sm:w-12",
                activeIndex === index ? "border-accent" : "border-transparent hover:border-line-strong",
              )}
            >
              <Image
                src={failedImages.has(src) ? "/placeholder.svg" : src}
                alt=""
                fill
                sizes="48px"
                className={contain ? "object-contain p-0.5" : "object-cover"}
                onError={() => rememberFailure(src)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
