"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";

export interface Tab {
  label: string;
  href: string;
  /** Match this path prefix to determine active state. Defaults to href. */
  match?: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  className?: string;
}

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const pathname = usePathname();

  const isActive = (tab: Tab) => {
    const match = tab.match || tab.href;
    if (match === tabs[0]?.href) {
      // First tab: exact match only (avoid matching all sub-paths)
      return pathname === match || pathname === match + "/";
    }
    return pathname === match || pathname.startsWith(match + "/");
  };

  return (
    <div className={cn("flex items-center gap-1 border-b mb-4", className)}>
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors relative",
              "hover:text-foreground",
              active
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// Pre-configured tab sets for each section
export const PRODUCT_TABS: Tab[] = [
  { label: "Products", href: "/dashboard/products" },
  { label: "Collections", href: "/dashboard/collections" },
  { label: "Categories", href: "/dashboard/categories" },
  { label: "Attributes", href: "/dashboard/attributes" },
  { label: "Gift Cards", href: "/dashboard/gift-cards" },
];

export const ORDER_TABS: Tab[] = [
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Returns", href: "/dashboard/orders/returns" },
];

export const MARKETING_TABS: Tab[] = [
  { label: "Vouchers", href: "/dashboard/marketing/discounts" },
  { label: "Sales", href: "/dashboard/marketing/discounts", match: "/dashboard/marketing/discounts" },
];

export const ANALYTICS_TABS: Tab[] = [
  { label: "Overview", href: "/dashboard/analytics" },
  { label: "Finances", href: "/dashboard/finances" },
];

export const CUSTOMER_TABS: Tab[] = [
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Groups", href: "/dashboard/customers/groups" },
];
