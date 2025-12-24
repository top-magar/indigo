"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function StoreEditorListError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Store Editor List Error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                    <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Failed to load pages</h1>
                <p className="mt-2 text-muted-foreground">
                    We couldn&apos;t load your store pages. Please try again.
                </p>
                {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset}>
                        <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
