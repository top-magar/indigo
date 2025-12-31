import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttributesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-8 w-12 mt-1" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Skeleton className="h-10 flex-1 max-w-sm" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="p-4 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-5 w-5" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-24 mt-1" />
                                </div>
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
