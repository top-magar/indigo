"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Printer, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CopyableText } from "@/components/ui/copyable-text";
import { format } from "date-fns";
import type { Order } from "@/features/orders/types";
import { OrderStatusBadge, PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/dashboard/status-badge";

interface OrderHeaderProps {
    order: Order;
    onCancel?: () => void;
}

export function OrderHeader({ order, onCancel }: OrderHeaderProps) {

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold tracking-tight">
                            Order #
                        </h1>
                        <CopyableText 
                            text={order.orderNumber} 
                            mono 
                            size="lg"
                            className="text-lg font-semibold"
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
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <FulfillmentStatusBadge status={order.fulfillmentStatus} />
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.print()}>
                            <Printer className="size-4" />
                            Print Order
                        </DropdownMenuItem>
                        {order.customer.email && (
                            <DropdownMenuItem>
                                <Mail className="size-4" />
                                Email Customer
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {order.status !== "cancelled" && order.status !== "completed" && (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={onCancel}
                            >
                                <X className="size-4" />
                                Cancel Order
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
