"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Box,
  CreditCard,
  FileText,
  Gift,
  Image,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  Users,
  Wallet,
  Layers,
  FolderTree,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart, shortcut: "G O" },
  { label: "Products", href: "/dashboard/products", icon: Package, shortcut: "G P" },
  { label: "Customers", href: "/dashboard/customers", icon: Users, shortcut: "G C" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, shortcut: "G A" },
  { label: "Inventory", href: "/dashboard/inventory", icon: Box, shortcut: "G I" },
  { label: "Media", href: "/dashboard/media", icon: Image, shortcut: "G M" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, shortcut: "G S" },
  { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { label: "Collections", href: "/dashboard/collections", icon: Layers },
  { label: "Attributes", href: "/dashboard/attributes", icon: Tags },
  { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Gift Cards", href: "/dashboard/gift-cards", icon: Gift },
  { label: "Finances", href: "/dashboard/finances", icon: Wallet },
  { label: "Pages", href: "/dashboard/pages", icon: FileText },
  { label: "Payments", href: "/dashboard/settings/payments", icon: CreditCard },
];

const QUICK_ACTIONS = [
  { label: "Create Product", href: "/dashboard/products/new", icon: Package },
  { label: "Create Order", href: "/dashboard/orders/new", icon: ShoppingCart },
  { label: "Add Customer", href: "/dashboard/customers?action=new", icon: Users },
  { label: "Upload Media", href: "/dashboard/media?action=upload", icon: Image },
];

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((item) => (
            <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-muted-foreground tabular-nums">{item.shortcut}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
