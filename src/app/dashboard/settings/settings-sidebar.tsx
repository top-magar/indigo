"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";
import {
  Store, CreditCard, Truck, Receipt, ShoppingBag,
  Globe, User, Users, Bell,
} from "lucide-react";

const sections = [
  { label: "Store", items: [
    { title: "General", href: "/dashboard/settings", icon: Store, description: "Name, logo, currency" },
    { title: "Domains", href: "/dashboard/settings/domains", icon: Globe, description: "Custom domains" },
  ]},
  { label: "Commerce", items: [
    { title: "Payments", href: "/dashboard/settings/payments", icon: CreditCard, description: "eSewa, Khalti, cards" },
    { title: "Checkout", href: "/dashboard/settings/checkout", icon: ShoppingBag, description: "Checkout flow" },
    { title: "Shipping", href: "/dashboard/settings/shipping", icon: Truck, description: "Zones and rates" },
    { title: "Tax", href: "/dashboard/settings/tax", icon: Receipt, description: "Tax collection" },
  ]},
  { label: "Account", items: [
    { title: "Account", href: "/dashboard/settings/account", icon: User, description: "Profile and security" },
    { title: "Team", href: "/dashboard/settings/team", icon: Users, description: "Members and roles" },
    { title: "Notifications", href: "/dashboard/settings/notifications", icon: Bell, description: "Alerts and channels" },
  ]},
];

const allItems = sections.flatMap(s => s.items);

export function SettingsSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard/settings" && pathname.startsWith(href));

  return (
    <>
      {/* Mobile: horizontal scrollable tabs */}
      <nav className="md:hidden -mx-3 px-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-1 pb-3 border-b mb-4">
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors shrink-0",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon className="size-3.5" />
              {item.title}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden md:block w-52 shrink-0 space-y-5 sticky top-20">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60 mb-1.5 px-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-none">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-none truncate">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
