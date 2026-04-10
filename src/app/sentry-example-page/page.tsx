"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SentryExamplePage() {
  const [result, setResult] = useState("");
  const [throwError, setThrowError] = useState(false);

  // This triggers during render — React error boundary + Sentry will catch it
  if (throwError) {
    throw new Error("Sentry render test error — delete this page");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-xl font-semibold">Sentry Test Page</h1>
        <p className="text-sm text-muted-foreground">
          Test that Sentry captures errors correctly.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="destructive" onClick={() => setThrowError(true)}>
            Throw Render Error
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const eventId = Sentry.captureException(new Error("Sentry manual capture test"));
              setResult(`Sent! Event ID: ${eventId}`);
            }}
          >
            Capture Exception
          </Button>
        </div>
        {result && <p className="text-xs text-green-600 font-mono">{result}</p>}
        <p className="text-xs text-muted-foreground">
          Check <a href="https://top-magar.sentry.io/issues/" target="_blank" className="underline">Sentry Issues</a> — errors should appear within 30s.
        </p>
      </div>
    </div>
  );
}
