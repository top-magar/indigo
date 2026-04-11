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
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-xl items-center gap-4 rounded-lg bg-gray-900 px-5 py-3 text-sm text-white shadow-lg">
      <p className="flex-1">{text}</p>
      <button onClick={() => dismiss(true)} className="rounded bg-white px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100">Accept</button>
      <button onClick={() => dismiss(false)} className="rounded border border-gray-600 px-3 py-1 text-sm hover:bg-gray-800">Decline</button>
    </div>
  );
}
