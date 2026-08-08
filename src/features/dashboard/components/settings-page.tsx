"use client";

import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface SettingsPageProps {
  title: string;
  subtitle?: string;
  onSave?: () => void;
  isPending?: boolean;
  hasChanges?: boolean;
  children: React.ReactNode;
}

export function SettingsPage({ title, subtitle, onSave, isPending, hasChanges, children }: SettingsPageProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onSave && (
          <Button onClick={onSave} disabled={isPending || !hasChanges} size="sm">
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
            {isPending ? "Saving…" : "Save"}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
