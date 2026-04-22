"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, ShoppingCart, Package, Users, BarChart3,
  Settings, LayoutDashboard, Layers, FolderTree, Tags, Gift,
  Warehouse, Image as ImageIcon, FileText, Star, Megaphone,
  DollarSign, Percent, Mail, CreditCard, Globe, Truck,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useKeyboardShortcutsHelp } from "@/hooks";
import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts-modal";
import type { ShortcutCategory } from "@/components/dashboard/keyboard-shortcuts/types";

// ─── Command Palette Data ────────────────────────────────

type CmdItem = { label: string; href: string; icon: typeof Search; keys?: string[] };

const ACTIONS: CmdItem[] = [
  { label: "Create Product", href: "/dashboard/products/new", icon: Plus, keys: ["C"] },
  { label: "Create Order", href: "/dashboard/orders/new", icon: ShoppingCart },
];

const PAGES: CmdItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keys: ["G", "D"] },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart, keys: ["G", "O"] },
  { label: "Products", href: "/dashboard/products", icon: Package, keys: ["G", "P"] },
  { label: "Customers", href: "/dashboard/customers", icon: Users, keys: ["G", "C"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keys: ["G", "A"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: Warehouse },
  { label: "Collections", href: "/dashboard/collections", icon: Layers },
  { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { label: "Attributes", href: "/dashboard/attributes", icon: Tags },
  { label: "Gift Cards", href: "/dashboard/gift-cards", icon: Gift },
  { label: "Media", href: "/dashboard/media", icon: ImageIcon },
  { label: "Pages", href: "/dashboard/pages", icon: FileText },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Discounts", href: "/dashboard/marketing/discounts", icon: Percent },
  { label: "Campaigns", href: "/dashboard/marketing/campaigns", icon: Mail },
  { label: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, keys: ["G", "S"] },
  { label: "Payments", href: "/dashboard/settings/payments", icon: CreditCard },
  { label: "Shipping", href: "/dashboard/settings/shipping", icon: Truck },
  { label: "Domains", href: "/dashboard/settings/domains", icon: Globe },
];

// ─── Keyboard Shortcuts ──────────────────────────────────

const GO_MAP: Record<string, string> = {
  d: "/dashboard", o: "/dashboard/orders", p: "/dashboard/products",
  c: "/dashboard/customers", a: "/dashboard/analytics",
  s: "/dashboard/settings", i: "/dashboard/inventory",
};

const SHORTCUT_CATS: ShortcutCategory[] = [
  { id: "nav", label: "Navigation", priority: 1, shortcuts: [
    { id: "go-dash", label: "Dashboard", keys: ["g", "d"], isSequence: true },
    { id: "go-ord", label: "Orders", keys: ["g", "o"], isSequence: true },
    { id: "go-prod", label: "Products", keys: ["g", "p"], isSequence: true },
    { id: "go-cust", label: "Customers", keys: ["g", "c"], isSequence: true },
    { id: "go-ana", label: "Analytics", keys: ["g", "a"], isSequence: true },
    { id: "go-set", label: "Settings", keys: ["g", "s"], isSequence: true },
  ]},
  { id: "act", label: "Actions", priority: 2, shortcuts: [
    { id: "cmd", label: "Command palette", keys: ["⌘", "k"] },
    { id: "create", label: "Create product", keys: ["c"] },
    { id: "help", label: "Keyboard shortcuts", keys: ["?"] },
  ]},
];

// ─── Kbd ─────────────────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-muted px-0.5 font-mono text-[9px] text-muted-foreground">{children}</kbd>;
}

// ─── Header ──────────────────────────────────────────────

export function DashboardHeader() {
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useKeyboardShortcutsHelp();
  const goPending = useRef(false);
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((href: string) => { router.push(href); setCmdOpen(false); }, [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const inInput = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable;

      // ⌘K always works
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen(o => !o); return; }
      if (inInput) return;

      // C → create product
      if (e.key === "c" && !e.metaKey && !goPending.current) { e.preventDefault(); router.push("/dashboard/products/new"); return; }

      // G → wait for second key
      if (e.key === "g" && !e.metaKey) {
        e.preventDefault();
        goPending.current = true;
        if (goTimer.current) clearTimeout(goTimer.current);
        goTimer.current = setTimeout(() => { goPending.current = false; }, 800);
        return;
      }

      if (goPending.current) {
        goPending.current = false;
        if (goTimer.current) clearTimeout(goTimer.current);
        const dest = GO_MAP[e.key.toLowerCase()];
        if (dest) { e.preventDefault(); router.push(dest); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); if (goTimer.current) clearTimeout(goTimer.current); };
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
        <SidebarTrigger />
        <div className="flex-1" />
        <Button
          variant="outline"
          className="h-8 w-56 lg:w-64 justify-start gap-2 text-muted-foreground text-xs"
          onClick={() => setCmdOpen(true)}
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <Kbd>⌘K</Kbd>
        </Button>
      </header>

      {/* Command Palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground">No results</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Actions">
            {ACTIONS.map(item => (
              <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-2">
                <div className="flex size-6 items-center justify-center rounded border bg-background shrink-0">
                  <item.icon className="size-3 text-muted-foreground" />
                </div>
                <span>{item.label}</span>
                {item.keys && <div className="ml-auto flex gap-0.5">{item.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}</div>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            {PAGES.map(item => (
              <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-2">
                <item.icon className="size-3.5 text-muted-foreground shrink-0" />
                <span>{item.label}</span>
                {item.keys && <div className="ml-auto flex gap-0.5">{item.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}</div>}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        <div className="flex items-center gap-3 border-t px-3 py-1.5 text-[9px] text-muted-foreground/60">
          <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> Navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> Open</span>
          <span className="flex items-center gap-1"><Kbd>esc</Kbd> Close</span>
        </div>
      </CommandDialog>

      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} categories={SHORTCUT_CATS} />
    </>
  );
}
