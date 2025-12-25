import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-6 w-20" />
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-36 rounded-none" />
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
