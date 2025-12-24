import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StoreEditorLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Homepage Card */}
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-24 rounded-md" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pages Grid */}
            <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Skeleton className="h-9 flex-1" />
                                    <Skeleton className="h-9 flex-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
