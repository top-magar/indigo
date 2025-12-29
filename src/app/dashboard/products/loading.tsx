import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductsLoading() {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-7 w-16" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Skeleton className="h-10 w-full sm:max-w-sm" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[140px]" />
                    <Skeleton className="h-10 w-[120px]" />
                </div>
            </div>

            {/* Table */}
            <Card>
                <div className="p-4">
                    {/* Table Header */}
                    <div className="flex gap-4 pb-4 border-b">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-4 w-[80px] hidden md:block" />
                        <Skeleton className="h-4 w-[70px]" />
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                    {/* Table Rows */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-[140px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-[60px] hidden md:block" />
                            <Skeleton className="h-4 w-[70px]" />
                            <Skeleton className="h-4 w-[30px]" />
                            <Skeleton className="h-6 w-[80px] rounded-full" />
                            <div className="flex gap-1">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}
