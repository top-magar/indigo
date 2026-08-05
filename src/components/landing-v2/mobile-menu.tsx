"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X, ArrowRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MobileMenuGroup } from "@/data/landing/navigation";

export function MobileMenu({ items }: { items: MobileMenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        className="lv2-burger"
        aria-expanded={open}
        aria-controls="lv2-mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </button>

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
                <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                  <ArrowRight aria-hidden />
                </a>
              ))}
            </div>
          </div>
        ))}

        <div className="lv2-mobile-menu__ctas">
          <a href="#demo" className="lv2-btn lv2-btn--ghost" onClick={() => setOpen(false)}>
            Request Demo
          </a>
          <a href="#waitlist" className="lv2-btn lv2-btn--primary" onClick={() => setOpen(false)}>
            Join Waitlist
          </a>
        </div>
      </div>
    </>
  );
}
