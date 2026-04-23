"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AuthError({
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
      <div className="max-w-sm text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load this page. Please try again.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
