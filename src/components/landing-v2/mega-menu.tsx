"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MegaMenuItem } from "@/data/landing/navigation";

export function MegaMenu({ item }: { item: MegaMenuItem }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        triggerRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        ref={triggerRef}
        className={cn("lv2-nav__trigger", open && "text-lv2-fg bg-lv2-panel-2")}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDown aria-hidden />
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="lv2-mega animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label={`${item.label} menu`}
        >
          <div className="lv2-mega__grid">
            {item.columns.map((column) => (
              <div key={column.title}>
                <div className="lv2-mega__col-title">{column.title}</div>
                {column.links.map((link) => (
                  <a key={link.label} href={link.href} className="lv2-mega__link">
                    <span className="lv2-mega__icon" aria-hidden>
                      <ArrowRight />
                    </span>
                    <span>
                      <strong>{link.label}</strong>
                      {link.description ? <span>{link.description}</span> : null}
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>
          {item.featured ? (
            <a href={item.featured.href} className="lv2-mega__featured">
              <span>
                <strong>{item.featured.label}</strong>
                {item.featured.description ? (
                  <span>{item.featured.description}</span>
                ) : null}
              </span>
              <ArrowRight aria-hidden />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
