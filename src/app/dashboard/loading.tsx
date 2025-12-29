import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>

                    {/* Stats cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-5">
                                    <Skeleton className="h-4 w-20 mb-2" />
                                    <Skeleton className="h-7 w-16" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <Skeleton className="h-[200px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Table card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
