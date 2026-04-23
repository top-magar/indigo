"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function EditorError({
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-sm text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Editor crashed</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong loading the editor. Your work has been auto-saved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/pages">
              <Home className="size-3.5" />
              Back to pages
            </Link>
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="size-3.5" />
            Reload editor
          </Button>
        </div>
      </div>
    </div>
  );
}
