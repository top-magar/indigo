"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function StoreError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Store error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-foreground">
                    Something went wrong
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    We encountered an error loading this store. Please try again.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Link>
                    </Button>
                    <Button onClick={reset}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
}
