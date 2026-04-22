"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils";

export interface Tab {
  label: string;
  href: string;
  /** Match this path prefix to determine active state. Defaults to href. */
  match?: string;
  /** Match specific search param for active state (e.g. "status=unfulfilled") */
  matchParam?: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  className?: string;
}

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (tab: Tab) => {
    const match = tab.match || tab.href.split("?")[0];
    const pathMatches = pathname === match || pathname === match + "/";

    // If tab has matchParam, check search params
    if (tab.matchParam) {
      const [key, value] = tab.matchParam.split("=");
      return pathMatches && searchParams.get(key) === value;
    }

    // First tab: exact match + no filter params active
    if (tab === tabs[0]) {
      const hasFilterParams = tabs.some(t => t.matchParam && searchParams.get(t.matchParam.split("=")[0]));
      return pathMatches && !hasFilterParams;
    }

    if (match === tabs[0]?.href.split("?")[0]) return pathMatches;
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
  { label: "All", href: "/dashboard/orders" },
  { label: "Unfulfilled", href: "/dashboard/orders?fulfillment=unfulfilled", match: "/dashboard/orders", matchParam: "fulfillment=unfulfilled" },
  { label: "Unpaid", href: "/dashboard/orders?payment=pending", match: "/dashboard/orders", matchParam: "payment=pending" },
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
