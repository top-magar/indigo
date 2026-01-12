"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/shared/utils";
import type { Customer } from "@/app/dashboard/customers/types";

interface CustomerOrdersCardProps {
    customer: Customer;
    currency: string;
}

const orderStatusConfig: Record<string, { color: string; bgColor: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10" },
    confirmed: { color: "text-chart-1", bgColor: "bg-chart-1/10" },
    processing: { color: "text-chart-1", bgColor: "bg-chart-1/10" },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5/10" },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2/10" },
    cancelled: { color: "text-destructive", bgColor: "bg-destructive/10" },
    refunded: { color: "text-destructive", bgColor: "bg-destructive/10" },
};

const paymentStatusConfig: Record<string, { color: string; bgColor: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10" },
    paid: { color: "text-chart-2", bgColor: "bg-chart-2/10" },
    partially_refunded: { color: "text-chart-5", bgColor: "bg-chart-5/10" },
    refunded: { color: "text-destructive", bgColor: "bg-destructive/10" },
    failed: { color: "text-destructive", bgColor: "bg-destructive/10" },
};

export function CustomerOrdersCard({ customer, currency }: CustomerOrdersCardProps) {
    const { recentOrders } = customer;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Recent Orders
                </CardTitle>
                {recentOrders.length > 0 && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/orders?customer=${customer.email}`}>
                            View all orders
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                            <ShoppingCart className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">No orders found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => {
                                const statusStyle = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
                                return (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/orders/${order.id}`}
                                    >
                                        <TableCell className="font-medium">
                                            #{order.orderNumber}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "border-0 capitalize",
                                                    statusStyle.bgColor,
                                                    statusStyle.color
                                                )}
                                            >
                                                {order.paymentStatus.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(order.total, order.currency || currency)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
