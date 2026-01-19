"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, BarChart3, Boxes, Plus } from "lucide-react";
import Link from "next/link";

interface QuickActionsCardProps {
  storeSlug?: string;
}

const QUICK_ACTIONS = [
  {
    label: "Add Product",
    href: "/dashboard/products/new",
    icon: Package,
    description: "Create a new product",
  },
  {
    label: "Create Order",
    href: "/dashboard/orders/new",
    icon: ShoppingCart,
    description: "Manual order entry",
  },
  {
    label: "View Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Sales insights",
  },
  {
    label: "Manage Inventory",
    href: "/dashboard/products?filter=low-stock",
    icon: Boxes,
    description: "Stock management",
  },
];

export function QuickActionsCard({ storeSlug }: QuickActionsCardProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base font-semibold text-[var(--ds-gray-900)]">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 px-3 hover:bg-[var(--ds-gray-100)] hover:border-[var(--ds-gray-300)] transition-all"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="h-8 w-8 rounded-lg bg-[var(--ds-brand-600)]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--ds-brand-600)]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                      {action.label}
                    </p>
                    <p className="text-xs text-[var(--ds-gray-600)]">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
        
        {storeSlug && (
          <Link href={`/store/${storeSlug}`} target="_blank">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-3 hover:bg-[var(--ds-gray-100)] hover:border-[var(--ds-gray-300)] transition-all mt-3 border-dashed"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-8 w-8 rounded-lg bg-[var(--ds-chart-2)]/10 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-[var(--ds-chart-2)]" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    View Store
                  </p>
                  <p className="text-xs text-[var(--ds-gray-600)]">
                    See your live storefront
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
