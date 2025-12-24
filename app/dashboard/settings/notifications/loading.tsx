import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsSettingsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-4 w-64" />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="h-6 w-11 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}
