"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Store,
  CreditCard,
  Truck,
  Receipt,
  ShoppingBag,
  Globe,
  User,
  Users,
  Bell,

} from "lucide-react";

const sections = [
  { label: "Store", items: [
    { title: "Store", href: "/dashboard/settings", icon: Store },
    { title: "Domains", href: "/dashboard/settings/domains", icon: Globe },
  ]},
  { label: "Commerce", items: [
    { title: "Payments", href: "/dashboard/settings/payments", icon: CreditCard },
    { title: "Checkout", href: "/dashboard/settings/checkout", icon: ShoppingBag },
    { title: "Shipping", href: "/dashboard/settings/shipping", icon: Truck },
    { title: "Tax", href: "/dashboard/settings/tax", icon: Receipt },
  ]},
  { label: "Account", items: [
    { title: "Account", href: "/dashboard/settings/account", icon: User },
    { title: "Team", href: "/dashboard/settings/team", icon: Users },
    { title: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  ]},
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 space-y-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 px-2">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard/settings" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
