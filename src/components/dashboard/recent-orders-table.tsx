"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";

export interface OrderData {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersTableProps {
  orders: OrderData[];
  currency: string;
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    delivered: "bg-[var(--ds-chart-2)]/10 text-[var(--ds-chart-2)]",
    completed: "bg-[var(--ds-chart-2)]/10 text-[var(--ds-chart-2)]",
    shipped: "bg-[var(--ds-chart-5)]/10 text-[var(--ds-chart-5)]",
    processing: "bg-[var(--ds-chart-1)]/10 text-[var(--ds-chart-1)]",
    confirmed: "bg-[var(--ds-chart-1)]/10 text-[var(--ds-chart-1)]",
    pending: "bg-[var(--ds-chart-4)]/10 text-[var(--ds-chart-4)]",
    cancelled: "bg-[var(--ds-red-100)] text-[var(--ds-red-800)]",
  };
  return statusMap[status.toLowerCase()] || "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-2xl bg-[var(--ds-gray-100)] flex items-center justify-center mb-3">
        <ShoppingCart className="w-6 h-6 text-[var(--ds-gray-500)]" />
      </div>
      <p className="text-sm text-[var(--ds-gray-800)] font-medium">No orders yet</p>
      <p className="text-xs text-[var(--ds-gray-600)] mt-1">
        Orders will appear here when customers make purchases
      </p>
    </div>
  );
}

export function RecentOrdersTable({ orders, currency }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 space-y-0">
        <CardTitle className="text-base font-semibold text-[var(--ds-gray-900)]">
          Recent Orders
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/orders" className="text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]">
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--ds-gray-100)] transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[var(--ds-brand-600)]/10 flex items-center justify-center text-xs font-medium text-[var(--ds-brand-600)] shrink-0">
                    {order.customerName?.charAt(0).toUpperCase() ||
                      order.customerEmail?.charAt(0).toUpperCase() ||
                      "G"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--ds-gray-900)] group-hover:text-[var(--ds-brand-600)] transition-colors truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[var(--ds-gray-600)] truncate">
                      {order.customerName || order.customerEmail || "Guest"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    {formatCurrency(order.total, currency)}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] border-0 mt-1 ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
