import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDetailLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-10" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-12" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Orders */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-28" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-16" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
