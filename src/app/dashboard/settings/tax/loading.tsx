import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TaxSettingsLoading() {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-64" />
            </div>
            {[1, 2].map((i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-56" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2].map((j) => (
                            <div key={j} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <Skeleton className="h-6 w-10 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
