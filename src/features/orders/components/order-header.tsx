"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    MoreHorizontalIcon,
    PrinterIcon,
    Mail01Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyableText } from "@/components/ui/copyable-text";
import { format } from "date-fns";
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from "@/features/orders/types";
import { cn } from "@/shared/utils";

interface OrderHeaderProps {
    order: Order;
    onCancel?: () => void;
}

const statusConfig: Record<OrderStatus, { color: string; bgColor: string; label: string }> = {
    draft: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Draft" },
    unconfirmed: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Unconfirmed" },
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Pending" },
    confirmed: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Confirmed" },
    processing: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Processing" },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Shipped" },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Delivered" },
    completed: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Completed" },
    cancelled: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Cancelled" },
    returned: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Returned" },
    refunded: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Refunded" },
};

const paymentStatusConfig: Record<PaymentStatus, { color: string; bgColor: string; label: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Unpaid" },
    authorized: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Authorized" },
    paid: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Paid" },
    partially_paid: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Partial" },
    partially_refunded: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Partial Refund" },
    refunded: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Refunded" },
    failed: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Failed" },
    cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Cancelled" },
};

const fulfillmentStatusConfig: Record<FulfillmentStatus, { color: string; bgColor: string; label: string }> = {
    unfulfilled: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Unfulfilled" },
    partially_fulfilled: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Partial" },
    fulfilled: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Fulfilled" },
    awaiting_approval: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Awaiting Approval" },
    returned: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Returned" },
    cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Cancelled" },
};

export function OrderHeader({ order, onCancel }: OrderHeaderProps) {
    const status = statusConfig[order.status] || statusConfig.pending;
    const payment = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
    const fulfillment = fulfillmentStatusConfig[order.fulfillmentStatus] || fulfillmentStatusConfig.unfulfilled;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/orders">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Order #
                        </h1>
                        <CopyableText 
                            text={order.orderNumber} 
                            mono 
                            size="lg"
                            className="text-2xl font-bold"
                            tooltipText="Copy order number"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "PPP 'at' p")}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Status Badges */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("border-0", status.bgColor, status.color)}>
                        {status.label}
                    </Badge>
                    <Badge variant="secondary" className={cn("border-0", payment.bgColor, payment.color)}>
                        {payment.label}
                    </Badge>
                    <Badge variant="secondary" className={cn("border-0", fulfillment.bgColor, fulfillment.color)}>
                        {fulfillment.label}
                    </Badge>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.print()}>
                            <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
                            Print Order
                        </DropdownMenuItem>
                        {order.customer.email && (
                            <DropdownMenuItem>
                                <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 mr-2" />
                                Email Customer
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {order.status !== "cancelled" && order.status !== "completed" && (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={onCancel}
                            >
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                                Cancel Order
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
