import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="size-8 rounded-full" />
      </div>

      {/* Hero skeleton */}
      <Skeleton className="w-full h-64" />

      {/* Products grid skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
