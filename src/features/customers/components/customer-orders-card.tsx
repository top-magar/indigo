"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/shared/utils";
import type { Customer } from "@/app/dashboard/customers/types";
import { OrderStatusBadge } from "@/components/dashboard/status-badge";

interface CustomerOrdersCardProps {
    customer: Customer;
    currency: string;
}

export function CustomerOrdersCard({ customer, currency }: CustomerOrdersCardProps) {
    const { recentOrders } = customer;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <Package className="size-4" />
                    Recent Orders
                </CardTitle>
                {recentOrders.length > 0 && (
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/orders?customer=${customer.email}`}>
                            View all orders
                            <ArrowRight className="size-4 ml-1" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                            <Package className="size-5 text-muted-foreground/50" />
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
                                            <OrderStatusBadge status={order.paymentStatus} />
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
