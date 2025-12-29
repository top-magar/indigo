import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-7 w-12" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stock Health & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-24" />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-28" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Skeleton className="h-10 w-64" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <Skeleton className="h-9 w-9 ml-auto" />
            </div>

            {/* Table */}
            <Card>
                <div className="p-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16 hidden lg:block" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-24 hidden md:block" />
                        <Skeleton className="h-4 w-16 hidden lg:block ml-auto" />
                    </div>
                    
                    {/* Rows */}
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-16 hidden lg:block" />
                            <div className="flex flex-col items-center gap-1">
                                <Skeleton className="h-6 w-8" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-2 w-24 hidden md:block" />
                            <Skeleton className="h-4 w-16 hidden lg:block" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
