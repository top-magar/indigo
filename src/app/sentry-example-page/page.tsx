"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SentryExamplePage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-xl font-semibold">Sentry Test Page</h1>
        <p className="text-sm text-muted-foreground">
          Click the button to throw a test error and verify Sentry is capturing it.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="destructive"
            onClick={() => {
              throw new Error("Sentry frontend test error — delete this page");
            }}
          >
            Throw Client Error
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              Sentry.captureException(new Error("Sentry manual capture test"));
              setSent(true);
            }}
          >
            {sent ? "✓ Sent to Sentry" : "Capture Exception"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Check <a href="https://top-magar.sentry.io/issues/" target="_blank" className="underline">Sentry Issues</a> — errors should appear within 30s.
        </p>
      </div>
    </div>
  );
}
