"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import { motion } from "framer-motion";
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

const statusColor: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "",
};

export function RecentOrdersTable({ orders, currency }: RecentOrdersTableProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }} className="motion-reduce:!opacity-100 motion-reduce:!transform-none">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4 space-y-0">
        <CardTitle className="text-base font-semibold tracking-[-0.32px]">Recent Orders</CardTitle>
        <Button variant="ghost" asChild className="text-xs">
          <Link href="/dashboard/orders">
            View all <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <ShoppingCart className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Orders will appear here once customers start buying</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/dashboard/orders/new">
                Create an order <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>
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
                    <p className="text-xs font-medium truncate">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.customerName || order.customerEmail || "Guest"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-medium tabular-nums">{formatCurrency(order.total, currency)}</p>
                  <Badge variant={statusVariant[order.status.toLowerCase()] || "outline"} className={`mt-1 ${statusColor[order.status.toLowerCase()] || ""}`}>
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
