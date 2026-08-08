"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { heroContent } from "@/data/landing/hero";
import type { MobileMenuGroup } from "@/data/landing/navigation";

/** All focusable elements inside the dialog, in DOM order. */
function getFocusables(root: HTMLElement): HTMLElement[] {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Scroll lock while open
  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  // Keyboard: Escape closes, Tab cycles within the dialog (focus trap)
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = getFocusables(dialog);
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Restore focus to the trigger when the dialog closes
  useEffect(() => {
    if (!open && restoreFocusRef.current) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);

  return (
    <div
      ref={dialogRef}
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
