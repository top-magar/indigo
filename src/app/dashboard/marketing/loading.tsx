import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3.5 w-48" />
      </div>
      <Skeleton className="h-7 w-64 rounded-md" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
