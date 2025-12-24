"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Add01Icon,
  PackageIcon,
  ShoppingCart01Icon,
  UserMultipleIcon,
  Settings01Icon,
  AnalyticsUpIcon,
  Store01Icon,
  Tag01Icon,
  Discount01Icon,
  TruckDeliveryIcon,
  CreditCardIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface CommandPaletteProps {
  storeSlug?: string;
}

export function CommandPalette({ storeSlug }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Search01Icon} className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <Kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/products/new"))}
            >
              <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Add new product</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/orders"))}
            >
              <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4 opacity-60" />
              <span>View orders</span>
              <CommandShortcut>⌘O</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/customers"))}
            >
              <HugeiconsIcon icon={UserMultipleIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>View customers</span>
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard"))}
            >
              <HugeiconsIcon icon={AnalyticsUpIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/products"))}
            >
              <HugeiconsIcon icon={PackageIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Products</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/categories"))}
            >
              <HugeiconsIcon icon={Tag01Icon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Categories</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/inventory"))}
            >
              <HugeiconsIcon icon={TruckDeliveryIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Inventory</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/marketing"))}
            >
              <HugeiconsIcon icon={Discount01Icon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Marketing</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}
            >
              <HugeiconsIcon icon={AnalyticsUpIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Store">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/store-editor"))}
            >
              <HugeiconsIcon icon={PaintBoardIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Store Editor</span>
            </CommandItem>
            {storeSlug && (
              <CommandItem
                onSelect={() => runCommand(() => window.open(`/store/${storeSlug}`, "_blank"))}
              >
                <HugeiconsIcon icon={Store01Icon} className="mr-2 h-4 w-4 opacity-60" />
                <span>View storefront</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
            >
              <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4 opacity-60" />
              <span>General settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/dashboard/settings/payments"))}
            >
              <HugeiconsIcon icon={CreditCardIcon} className="mr-2 h-4 w-4 opacity-60" />
              <span>Payment settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
