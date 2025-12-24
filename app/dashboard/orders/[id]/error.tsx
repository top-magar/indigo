"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function OrderDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                        <HugeiconsIcon
                            icon={AlertCircleIcon}
                            className="h-7 w-7 text-destructive"
                        />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-foreground">
                        Order not found
                    </h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        We couldn&apos;t load this order. It may have been deleted or you don&apos;t have access.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/orders">
                                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                                All Orders
                            </Link>
                        </Button>
                        <Button onClick={reset}>
                            <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
                            Try again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
