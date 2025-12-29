import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CampaignsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-9 w-36" />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Campaigns List */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-[200px]" />
                            <Skeleton className="h-9 w-[140px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Loading() {
    return <CampaignsLoading />;
}
