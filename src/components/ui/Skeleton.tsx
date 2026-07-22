import { cn } from "@/src/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[2px] bg-[#E7DCC4] animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%] bg-gradient-to-r from-[#E7DCC4] via-[#FBF6EC] to-[#E7DCC4]",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-[3px]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container py-8 bg-[#FBF6EC]">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <Skeleton className="aspect-square w-full rounded-[3px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-16 rounded-[3px]" />
            <Skeleton className="h-10 w-16 rounded-[3px]" />
            <Skeleton className="h-10 w-16 rounded-[3px]" />
          </div>
          <Skeleton className="h-12 w-full rounded-[3px]" />
        </div>
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-4 w-24 mb-8" />
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
