import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Pre-computed heights for skeleton bars to avoid Math.random() in Server Components
const SKELETON_HEIGHTS = [45, 78, 32, 89, 56, 23, 67, 91, 34, 72, 48, 85, 29, 63, 95, 41, 76, 38, 82, 54]

export default function AnalyticsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-7 w-20" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-6">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="h-[200px] flex items-end gap-1">
                                {SKELETON_HEIGHTS.map((height, i) => (
                                    <Skeleton
                                        key={i}
                                        className="flex-1"
                                        style={{ height: `${height}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Products & Categories */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center mb-4">
                            <Skeleton className="h-40 w-40 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Segments & Recent Orders */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-1.5 w-full" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-14" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
