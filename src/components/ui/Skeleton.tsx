import { cn } from "@/src/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("shimmer rounded-md", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-11 w-16" />
            <Skeleton className="h-11 w-16" />
            <Skeleton className="h-11 w-16" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-4 w-32 mb-6" />
      <Skeleton className="h-9 w-56 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
