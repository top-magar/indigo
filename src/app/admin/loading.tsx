import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map(j => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-40" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
