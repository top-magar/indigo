"use client";

import { ShoppingCart, Truck, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/features/orders/types";
import { formatCurrency } from "@/shared/utils";

interface OrderSummaryCardProps {
    order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        Subtotal ({order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""})
                    </span>
                    <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Shipping
                        {order.shippingMethod && (
                            <Badge variant="secondary" className="text-xs ml-1">
                                {order.shippingMethod}
                            </Badge>
                        )}
                    </span>
                    <span>
                        {order.shippingTotal > 0
                            ? formatCurrency(order.shippingTotal, order.currency)
                            : "Free"}
                    </span>
                </div>

                {/* Tax */}
                {order.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{formatCurrency(order.taxTotal, order.currency)}</span>
                    </div>
                )}

                {/* Discount */}
                {order.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-chart-2">
                        <span className="flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5" />
                            Discount
                            {order.discountCode && (
                                <Badge variant="secondary" className="text-xs ml-1 bg-chart-2/10 text-chart-2 border-0">
                                    {order.discountCode}
                                </Badge>
                            )}
                        </span>
                        <span>-{formatCurrency(order.discountTotal, order.currency)}</span>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                        {formatCurrency(order.total, order.currency)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
