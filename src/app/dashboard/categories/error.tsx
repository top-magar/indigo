"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
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
        <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-4 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="size-7 text-destructive" />
                    </div>
                    <h2 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                        Something went wrong
                    </h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        We encountered an error loading this page. Please try again.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="size-3.5" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button onClick={reset}>
                            <RefreshCw className="size-3.5" />
                            Try again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
