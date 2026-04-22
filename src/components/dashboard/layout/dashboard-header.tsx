"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, Store, Plus, ShoppingCart, Package, Users, BarChart3,
  Settings, LayoutDashboard, Layers, FolderTree, Tags, Gift,
  Warehouse, Image as ImageIcon, FileText, Star, Megaphone,
  DollarSign, Percent, Mail, CreditCard, Globe, Bell, Truck,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { NotificationCenter } from "@/components/dashboard/notifications";
import { useKeyboardShortcutsHelp } from "@/hooks";
import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts-modal";
import type { ShortcutCategory } from "@/components/dashboard/keyboard-shortcuts/types";

// ─── Route Config ────────────────────────────────────────

const ROUTES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/orders": "Orders",
  "/dashboard/orders/returns": "Returns",
  "/dashboard/orders/abandoned": "Abandoned Carts",
  "/dashboard/orders/new": "New Order",
  "/dashboard/products": "Products",
  "/dashboard/products/new": "New Product",
  "/dashboard/inventory": "Inventory",
  "/dashboard/categories": "Categories",
  "/dashboard/collections": "Collections",
  "/dashboard/gift-cards": "Gift Cards",
  "/dashboard/attributes": "Attributes",
  "/dashboard/customers": "Customers",
  "/dashboard/customers/groups": "Customer Groups",
  "/dashboard/media": "Media",
  "/dashboard/pages": "Pages",
  "/dashboard/reviews": "Reviews",
  "/dashboard/marketing/discounts": "Discounts",
  "/dashboard/marketing/campaigns": "Campaigns",
  "/dashboard/analytics": "Analytics",
  "/dashboard/finances": "Finances",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/storefront": "Storefront",
  "/dashboard/settings/payments": "Payments",
  "/dashboard/settings/checkout": "Checkout",
  "/dashboard/settings/shipping": "Shipping",
  "/dashboard/settings/tax": "Tax",
  "/dashboard/settings/domains": "Domains",
  "/dashboard/settings/account": "Account",
  "/dashboard/settings/team": "Team",
  "/dashboard/settings/notifications": "Notifications",
};

const PARENTS: Record<string, string> = {
  "/dashboard/orders/returns": "/dashboard/orders",
  "/dashboard/orders/abandoned": "/dashboard/orders",
  "/dashboard/orders/new": "/dashboard/orders",
  "/dashboard/products/new": "/dashboard/products",
  "/dashboard/customers/groups": "/dashboard/customers",
  "/dashboard/marketing/discounts": "/dashboard/marketing/discounts",
  "/dashboard/marketing/campaigns": "/dashboard/marketing/discounts",
};

// ─── Breadcrumb ──────────────────────────────────────────

function Crumbs({ pathname }: { pathname: string }) {
  if (pathname === "/dashboard") {
    return <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage className="text-sm font-medium">Dashboard</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>;
  }

  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/dashboard" }];

  // Settings sub-pages get Settings as parent
  const segs = pathname.split("/").filter(Boolean);
  if (segs[1] === "settings" && segs.length > 2) {
    crumbs.push({ label: "Settings", href: "/dashboard/settings" });
  }

  // Known parent
  const parent = PARENTS[pathname];
  if (parent && ROUTES[parent]) {
    crumbs.push({ label: ROUTES[parent], href: parent });
  }

  // Current page
  crumbs.push({ label: ROUTES[pathname] || "Details", href: pathname });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, i) => (
          <React.Fragment key={c.href + i}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {i === crumbs.length - 1
                ? <BreadcrumbPage className="text-sm font-medium">{c.label}</BreadcrumbPage>
                : <BreadcrumbLink href={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{c.label}</BreadcrumbLink>
              }
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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

const GO_MAP: Record<string, string> = { d: "/dashboard", o: "/dashboard/orders", p: "/dashboard/products", c: "/dashboard/customers", m: "/dashboard/marketing/discounts", a: "/dashboard/analytics", s: "/dashboard/settings", i: "/dashboard/inventory" };

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

// ─── Kbd Component ───────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">{children}</kbd>;
}

// ─── Header ──────────────────────────────────────────────

export function DashboardHeader({ storeSlug }: { storeSlug?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useKeyboardShortcutsHelp();
  const goPending = useRef(false);
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((href: string) => { router.push(href); setCmdOpen(false); }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen(o => !o); }
        return;
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmdOpen(o => !o); return; }
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && !goPending.current) { e.preventDefault(); router.push("/dashboard/products/new"); return; }
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); goPending.current = true; if (goTimer.current) clearTimeout(goTimer.current); goTimer.current = setTimeout(() => { goPending.current = false; }, 800); return; }
      if (goPending.current) { goPending.current = false; if (goTimer.current) clearTimeout(goTimer.current); const dest = GO_MAP[e.key.toLowerCase()]; if (dest) { e.preventDefault(); router.push(dest); } }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); if (goTimer.current) clearTimeout(goTimer.current); };
  }, [router]);

  return (
    <>
      {/* ── Header Bar ── */}
      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
        <SidebarTrigger />
        <div className="hidden md:block"><Crumbs pathname={pathname} /></div>
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <Button variant="outline" className="h-8 w-56 lg:w-64 justify-start gap-2 text-muted-foreground text-xs" onClick={() => setCmdOpen(true)}>
            <Search className="size-3.5 shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <Kbd>⌘K</Kbd>
          </Button>

          <NotificationCenter tenantId="" userId="" enableRealtime={false} />

          {storeSlug && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex" asChild>
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Store className="size-3.5" />
                View Store
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* ── Command Palette ── */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Actions">
            {ACTIONS.map(item => (
              <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-3 py-2.5">
                <div className="flex size-7 items-center justify-center rounded-md border bg-background shrink-0">
                  <item.icon className="size-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm">{item.label}</span>
                {item.keys && <div className="ml-auto flex gap-1">{item.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}</div>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Go to">
            {PAGES.map(item => (
              <CommandItem key={item.href} onSelect={() => go(item.href)} className="gap-3">
                <item.icon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm">{item.label}</span>
                {item.keys && <div className="ml-auto flex gap-1">{item.keys.map((k, i) => <Kbd key={i}>{k}</Kbd>)}</div>}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        <div className="flex items-center gap-4 border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Kbd>↑↓</Kbd> Navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> Open</span>
          <span className="flex items-center gap-1"><Kbd>esc</Kbd> Close</span>
        </div>
      </CommandDialog>

      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} categories={SHORTCUT_CATS} />
    </>
  );
}
