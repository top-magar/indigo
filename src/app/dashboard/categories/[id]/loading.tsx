import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="size-8" />
                <Skeleton className="h-8 w-48" />
                <div className="ml-auto flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
