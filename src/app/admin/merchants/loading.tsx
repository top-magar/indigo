import { Skeleton } from "@/components/ui/skeleton";

export default function MerchantsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t">
              {[1, 2, 3].map(j => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-2 w-12" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
