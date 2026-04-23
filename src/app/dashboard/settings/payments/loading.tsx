import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Card>
                <CardContent className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-7 w-24" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
