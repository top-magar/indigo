import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountSettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-px w-full" />
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-9 w-20" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
