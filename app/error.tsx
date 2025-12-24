"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

export default function Error({
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <HugeiconsIcon
                        icon={AlertCircleIcon}
                        className="h-8 w-8 text-destructive"
                    />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Something went wrong
                </h2>
                <p className="mb-6 text-muted-foreground">
                    An unexpected error occurred. Please try again or contact support if
                    the problem persists.
                </p>
                <Button onClick={reset} className="gap-2">
                    <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                    Try again
                </Button>
            </div>
        </div>
    );
}
