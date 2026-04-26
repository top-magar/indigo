import { Skeleton } from "@/components/ui/skeleton";

export default function VerificationLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64 mt-2" />
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9" />)}
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
