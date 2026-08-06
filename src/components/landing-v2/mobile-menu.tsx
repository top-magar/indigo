"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { heroContent } from "@/data/landing/hero";
import type { MobileMenuGroup } from "@/data/landing/navigation";

export function MobileMenu({
  items,
  open,
  onClose,
}: {
  items: MobileMenuGroup[];
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      id="lv2-mobile-menu"
      className={cn("lv2-mobile-menu", open ? "" : "hidden")}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      {items.map((group) => (
        <div key={group.key} className="lv2-mobile-group">
          <button
            className="lv2-mobile-group__btn"
            aria-expanded={expanded === group.key}
            onClick={() => setExpanded(expanded === group.key ? null : group.key)}
          >
            {group.label}
            <ChevronDown aria-hidden />
          </button>
          <div
            className="lv2-mobile-group__links"
            hidden={expanded !== group.key}
          >
            {group.links.map((link) => (
              <a key={link.label} href={link.href} onClick={onClose}>
                {link.label}
                <ArrowRight aria-hidden />
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="lv2-mobile-menu__ctas">
        <a href={heroContent.primary.href} className="lv2-btn lv2-btn--ghost" onClick={onClose}>
          {heroContent.primary.label}
        </a>
        <a href={heroContent.secondary.href} className="lv2-btn lv2-btn--primary" onClick={onClose}>
          {heroContent.secondary.label}
        </a>
      </div>
    </div>
  );
}
