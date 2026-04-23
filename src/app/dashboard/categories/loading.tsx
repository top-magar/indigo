import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-64 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>

      {/* Table header */}
      <div className="flex items-center gap-4 h-10 px-2 border-b">
        <Skeleton className="size-3.5" />
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3.5 w-20 ml-auto" />
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-20" />
      </div>

      {/* Table rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 h-12 px-2 border-b border-border/50">
          <Skeleton className="size-3.5" />
          <Skeleton className="size-8 rounded-md" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3.5 w-16 ml-auto" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      ))}
    </div>
  );
}

