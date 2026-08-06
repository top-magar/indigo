"use client";

import { useEffect, useRef } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  ChartColumn,
  ChevronDown,
  CreditCard,
  Download,
  Layers,
  Layout,
  LifeBuoy,
  List,
  Package,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Terminal,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MegaMenuItem, MegaMenuIcon } from "@/data/landing/navigation";

/** Per-link icons from navigation data (kebab-case key → lucide icon). */
const LINK_ICONS: Record<MegaMenuIcon, LucideIcon> = {
  activity: Activity,
  "bar-chart": ChartColumn,
  book: BookOpen,
  building: Building2,
  "credit-card": CreditCard,
  download: Download,
  layers: Layers,
  layout: Layout,
  "life-buoy": LifeBuoy,
  list: List,
  package: Package,
  scroll: ScrollText,
  "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
  star: Star,
  store: Store,
  terminal: Terminal,
  users: Users,
  wallet: Wallet,
};

type MegaMenuProps = {
  item: MegaMenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: number;
  total: number;
};

/**
 * Mega menu — controlled by the header (one panel open at a time).
 *
 * Hover model: the wrapper owns both the trigger and the absolutely-positioned
 * anchor (which carries the 8px gap as padding-top), so moving from trigger to
 * panel never leaves the wrapper — no mouseleave race, no dead zone.
 *
 * Keyboard (disclosure pattern, WAI-ARIA APG):
 *  - ArrowDown / ArrowUp on the trigger: open and focus first/last link
 *  - ArrowDown / ArrowUp / Home / End inside the panel: roving focus
 *  - Escape: close and return focus to the trigger
 *  - Tab: native link order (links stay real, tabbable anchors)
 */
export function MegaMenu({ item, open, onOpenChange, index, total }: MegaMenuProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = `lv2-mega-${item.key}`;
  const openViaKeyboard = useRef(false);
  const pendingFocus = useRef<"first" | "last">("first");

  // When the panel was opened by keyboard, move focus into it after mount.
  useEffect(() => {
    if (!open || !openViaKeyboard.current) return;
    openViaKeyboard.current = false;
    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>(".lv2-mega a");
    if (!links?.length) return;
    const target = pendingFocus.current === "last" ? links[links.length - 1] : links[0];
    target.focus();
  }, [open]);

  // Global close: Escape + pointer-down outside the wrapper.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, onOpenChange]);

  const focusStep = (direction: 1 | -1) => {
    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>(".lv2-mega a");
    if (!links?.length) return;
    const current = Array.prototype.indexOf.call(links, document.activeElement);
    const next =
      current === -1
        ? direction === 1
          ? 0
          : links.length - 1
        : (current + direction + links.length) % links.length;
    links[next].focus();
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!open) {
      openViaKeyboard.current = true;
      pendingFocus.current = event.key === "ArrowDown" ? "first" : "last";
      onOpenChange(true);
    } else {
      focusStep(event.key === "ArrowDown" ? 1 : -1);
    }
  };

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        focusStep(event.key === "ArrowDown" ? 1 : -1);
        break;
      case "Home":
        event.preventDefault();
        panelRef.current?.querySelector<HTMLAnchorElement>(".lv2-mega a")?.focus();
        break;
      case "End": {
        event.preventDefault();
        const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>(".lv2-mega a");
        links?.[links.length - 1]?.focus();
        break;
      }
      case "Escape":
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const closeOnNavigate = (href: string) => {
    onOpenChange(false);
    // In-page anchors scroll the page; the browser's fragment-navigation
    // default action runs after the click handler and moves focus to the
    // target (or body), so restore focus on the next frame instead.
    if (href.startsWith("#")) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  return (
    <div
      ref={wrapRef}
      className="lv2-mega-wrap"
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn("lv2-nav__trigger", open && "lv2-nav__trigger--open")}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKeyDown}
      >
        {item.label}
        <ChevronDown aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          className="lv2-mega-anchor"
          role="region"
          aria-label={`${item.label} menu`}
        >
          <div ref={panelRef} className="lv2-mega" onKeyDown={onPanelKeyDown}>
            <div className="lv2-mega__bar">
              <span>{item.label}</span>
              <span className="lv2-mega__bar-tag">
                {`SHEET 0${index + 1}/0${total}`}
              </span>
            </div>

            <div className="lv2-mega__grid">
              {item.columns.map((column) => (
                <div key={column.title} className="lv2-mega__col">
                  <div className="lv2-mega__col-title">{column.title}</div>
                  {column.links.map((link, linkIndex) => {
                    const Icon = (link.icon && LINK_ICONS[link.icon]) || ArrowRight;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        className="lv2-mega__link"
                        onClick={() => closeOnNavigate(link.href)}
                      >
                        <span className="lv2-mega__index" aria-hidden>
                          {String(linkIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="lv2-mega__icon" aria-hidden>
                          <Icon />
                        </span>
                        <span className="lv2-mega__text">
                          <strong>{link.label}</strong>
                          {link.description ? <span>{link.description}</span> : null}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>

            {item.featured ? (
              <a
                href={item.featured.href}
                className="lv2-mega__featured"
                onClick={() => closeOnNavigate(item.featured!.href)}
              >
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
        </div>
      ) : null}
    </div>
  );
}
