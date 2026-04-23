import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="flex h-screen bg-background">
      {/* Left panel */}
      <div className="w-64 border-r p-3 space-y-3">
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-[70vh] w-[60vw] rounded-lg" />
      </div>
      {/* Right panel */}
      <div className="w-72 border-l p-3 space-y-3">
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
