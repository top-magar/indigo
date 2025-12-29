import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Tabs */}
            <Skeleton className="h-10 w-80" />

            {/* Cards */}
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Save Button */}
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}
