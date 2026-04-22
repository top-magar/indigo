"use client";

import { Card } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";
import { Package, Palette, CreditCard, Globe } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Add product", desc: "List your first item", href: "/dashboard/products/new", icon: Package, color: "bg-info/10 text-info" },
  { label: "Customize store", desc: "Make it yours", href: "/storefront", icon: Palette, color: "bg-destructive/10 text-destructive" },
  { label: "Set up payments", desc: "Start accepting money", href: "/dashboard/settings/payments", icon: CreditCard, color: "bg-success/10 text-success" },
  { label: "Add domain", desc: "Go live with your brand", href: "/dashboard/settings/domains", icon: Globe, color: "bg-warning/10 text-warning" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}>
          <CardSpotlight>
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <div className={`size-8 rounded-lg ${a.color} flex items-center justify-center mb-3`}>
                <a.icon className="size-4" />
              </div>
              <p className="text-sm font-medium tracking-[-0.28px]">{a.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
            </Card>
          </CardSpotlight>
        </Link>
      ))}
    </div>
  );
}
