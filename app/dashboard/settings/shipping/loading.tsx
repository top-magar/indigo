import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ShippingSettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-6 w-10 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                </CardContent>
            </Card>

            {/* Shipping Zones */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-64 mt-1" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
