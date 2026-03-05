"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  completed: "default",
  shipped: "secondary",
  processing: "secondary",
  confirmed: "secondary",
  pending: "outline",
  cancelled: "destructive",
};

export function RecentOrdersTable({ orders, currency }: RecentOrdersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 space-y-0">
        <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/dashboard/orders">
            View all <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
        ) : (
          <div className="space-y-1">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                    {(order.customerName || order.customerEmail || "G").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.customerName || order.customerEmail || "Guest"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(order.total, currency)}</p>
                  <Badge variant={statusVariant[order.status.toLowerCase()] || "outline"} className="mt-1 text-[10px]">
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
