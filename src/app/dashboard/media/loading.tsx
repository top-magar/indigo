import { Skeleton } from "@/components/ui/skeleton";

export default function MediaLoading() {
  return (
    <div className="flex h-full">
      {/* Folder Sidebar Skeleton */}
      <div className="w-56 border-r bg-muted/30 p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-9 w-64" /> {/* Search */}
            <Skeleton className="h-9 w-32" /> {/* Filter */}
            <Skeleton className="h-9 w-32" /> {/* Sort */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" /> {/* View toggle */}
            <Skeleton className="h-9 w-28" /> {/* Upload button */}
          </div>
        </div>

        {/* Storage Usage Skeleton */}
        <div className="px-4 py-2 border-b">
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
