import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutSettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-72" />
            </div>

            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 2 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}
