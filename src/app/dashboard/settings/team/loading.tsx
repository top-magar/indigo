import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamSettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-1">
                                    <Skeleton className="h-7 w-8" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
