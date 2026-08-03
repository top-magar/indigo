"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative flex items-center justify-center bg-background border-b border-border py-2.5 px-4">
      <div className="flex items-center gap-3 font-payload-body text-sm">
        <span className="text-foreground">
          Indigo is now in public beta
        </span>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1 text-foreground hover:text-muted-foreground transition-colors group"
        >
          Learn More
          <ArrowRight
            size={14}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
