"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => { console.error(error); }, [error]);
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="size-5 text-destructive" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">Something went wrong</h2>
                    <p className="text-xs text-muted-foreground mt-1">Please try again or go back to the dashboard.</p>
                </div>
                <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" asChild><Link href="/dashboard"><ArrowLeft className="size-3.5 mr-1.5" />Dashboard</Link></Button>
                    <Button size="sm" onClick={reset}><RefreshCw className="size-3.5 mr-1.5" />Try again</Button>
                </div>
            </div>
        </div>
    );
}
