import { Skeleton } from "@/components/ui/skeleton";

export default function BillingSettingsLoading() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-56 mt-2" />
      </div>
      <div className="grid lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 rounded-lg border p-5 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
        <div className="lg:col-span-2 rounded-lg border p-5 space-y-4">
          <Skeleton className="h-3 w-12" />
          <div className="space-y-3">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
      </div>
    </div>
  );
}
