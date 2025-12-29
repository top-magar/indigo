import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-7 w-10" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Skeleton className="h-10 w-64" />
                <div className="flex items-center gap-2 ml-auto">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Categories List */}
            <Card>
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    
                    {/* Rows */}
                    <div className="divide-y">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-6 w-20 hidden md:block" />
                                <div className="gap-1 hidden md:flex">
                                    <Skeleton className="h-6 w-6" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
