"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon, Image01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Order, OrderLine } from "../types";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderItemsCardProps {
    order: Order;
    showFulfillmentStatus?: boolean;
}

export function OrderItemsCard({ order, showFulfillmentStatus = true }: OrderItemsCardProps) {
    const unfulfilledLines = order.lines.filter((line) => line.quantityToFulfill > 0);
    const hasUnfulfilled = unfulfilledLines.length > 0;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <HugeiconsIcon icon={PackageIcon} className="h-5 w-5" />
                        Order Items
                        <Badge variant="secondary" className="ml-2">
                            {order.lines.length} item{order.lines.length !== 1 ? "s" : ""}
                        </Badge>
                    </CardTitle>
                    {showFulfillmentStatus && hasUnfulfilled && (
                        <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-0">
                            {unfulfilledLines.reduce((sum, l) => sum + l.quantityToFulfill, 0)} to fulfill
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50%]">Product</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            {showFulfillmentStatus && <TableHead className="text-center">Fulfilled</TableHead>}
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.lines.map((line) => (
                            <OrderLineRow
                                key={line.id}
                                line={line}
                                currency={order.currency}
                                showFulfillmentStatus={showFulfillmentStatus}
                            />
                        ))}
                    </TableBody>
                </Table>

                {/* Order Summary */}
                <div className="border-t p-4 bg-muted/30 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(order.subtotal, order.currency)}</span>
                    </div>
                    {order.shippingTotal > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Shipping {order.shippingMethod && `(${order.shippingMethod})`}
                            </span>
                            <span>{formatCurrency(order.shippingTotal, order.currency)}</span>
                        </div>
                    )}
                    {order.taxTotal > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>{formatCurrency(order.taxTotal, order.currency)}</span>
                        </div>
                    )}
                    {order.discountTotal > 0 && (
                        <div className="flex justify-between text-sm text-chart-2">
                            <span>
                                Discount {order.discountCode && `(${order.discountCode})`}
                            </span>
                            <span>-{formatCurrency(order.discountTotal, order.currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(order.total, order.currency)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function OrderLineRow({
    line,
    currency,
    showFulfillmentStatus,
}: {
    line: OrderLine;
    currency: string;
    showFulfillmentStatus: boolean;
}) {
    const isFullyFulfilled = line.quantityToFulfill === 0;
    const isPartiallyFulfilled = line.quantityFulfilled > 0 && line.quantityToFulfill > 0;

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {line.productImage ? (
                            <Image
                                src={line.productImage}
                                alt={line.productName}
                                width={48}
                                height={48}
                                className="object-cover"
                            />
                        ) : (
                            <HugeiconsIcon icon={Image01Icon} className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{line.productName}</p>
                        {line.productSku && (
                            <p className="text-xs text-muted-foreground font-mono">
                                SKU: {line.productSku}
                            </p>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-center">{line.quantity}</TableCell>
            {showFulfillmentStatus && (
                <TableCell className="text-center">
                    <span
                        className={cn(
                            "font-medium",
                            isFullyFulfilled && "text-chart-2",
                            isPartiallyFulfilled && "text-chart-5",
                            !isFullyFulfilled && !isPartiallyFulfilled && "text-muted-foreground"
                        )}
                    >
                        {line.quantityFulfilled}/{line.quantity}
                    </span>
                </TableCell>
            )}
            <TableCell className="text-right">
                {formatCurrency(line.unitPrice, currency)}
            </TableCell>
            <TableCell className="text-right font-medium">
                {formatCurrency(line.totalPrice, currency)}
            </TableCell>
        </TableRow>
    );
}
