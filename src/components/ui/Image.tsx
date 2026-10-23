import NextImage, { type ImageProps } from "next/image";

/**
 * Product/category photos live in Supabase Storage and are compressed to a
 * resized WebP at upload (backend upload.service.ts), so they're served
 * straight from Supabase's CDN. Running them through Vercel's optimizer
 * spent the Hobby plan's 5K monthly image transformations. Local /public
 * assets (logo, hero slides) are a small fixed set and stay optimized.
 */
function isStorageImage(src: ImageProps["src"]): boolean {
  return typeof src === "string" && src.includes("/storage/v1/object/public/");
}

export default function Image(props: ImageProps) {
  return <NextImage {...props} unoptimized={props.unoptimized ?? isStorageImage(props.src)} />;
}
