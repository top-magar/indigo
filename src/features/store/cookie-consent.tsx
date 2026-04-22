"use client";

import { useState, useEffect } from "react";

const KEY = "cookie-consent";

export function CookieConsent({ text, enabled }: { text: string; enabled: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (enabled && !localStorage.getItem(KEY)) setShow(true);
  }, [enabled]);

  if (!show) return null;

  const dismiss = (accept: boolean) => {
    if (accept) localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-xl items-center gap-4 rounded-lg border bg-popover px-5 py-3 text-sm text-popover-foreground shadow-lg">
      <p className="flex-1">{text}</p>
      <button onClick={() => dismiss(true)} className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90">Accept</button>
      <button onClick={() => dismiss(false)} className="rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">Decline</button>
    </div>
  );
}
