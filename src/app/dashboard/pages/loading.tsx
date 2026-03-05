import { Skeleton } from "@/components/ui/skeleton";

export default function PagesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
