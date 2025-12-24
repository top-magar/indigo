import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StockHistoryLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-7 w-12 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Movement History */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-12" />
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div className="text-right space-y-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
