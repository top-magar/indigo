"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSettingsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertTriangle className="size-8 text-destructive" />
      <h2 className="text-sm font-medium">Failed to load billing</h2>
      <p className="text-xs text-muted-foreground max-w-sm text-center">{error.message || "Something went wrong"}</p>
      <Button variant="outline" size="sm" onClick={reset}>Try again</Button>
    </div>
  );
}
