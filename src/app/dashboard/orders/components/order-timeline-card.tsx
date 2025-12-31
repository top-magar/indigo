"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Clock01Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    CreditCardIcon,
    PackageIcon,
    DeliveryTruck01Icon,
    Mail01Icon,
    NoteIcon,
    Invoice01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import type { Order, OrderEvent, OrderEventType } from "../types";
import { cn } from "@/lib/utils";

interface OrderTimelineCardProps {
    order: Order;
}

const eventConfig: Record<OrderEventType, { icon: typeof Clock01Icon; color: string; bgColor: string }> = {
    order_created: { icon: CheckmarkCircle02Icon, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    order_confirmed: { icon: CheckmarkCircle02Icon, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    order_cancelled: { icon: Cancel01Icon, color: "text-destructive", bgColor: "bg-destructive/10" },
    order_updated: { icon: Clock01Icon, color: "text-chart-4", bgColor: "bg-chart-4/10" },
    payment_authorized: { icon: CreditCardIcon, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    payment_captured: { icon: CreditCardIcon, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    payment_refunded: { icon: CreditCardIcon, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    payment_voided: { icon: CreditCardIcon, color: "text-muted-foreground", bgColor: "bg-muted" },
    payment_failed: { icon: CreditCardIcon, color: "text-destructive", bgColor: "bg-destructive/10" },
    fulfillment_created: { icon: PackageIcon, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    fulfillment_approved: { icon: CheckmarkCircle02Icon, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    fulfillment_shipped: { icon: DeliveryTruck01Icon, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    fulfillment_delivered: { icon: CheckmarkCircle02Icon, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    fulfillment_cancelled: { icon: Cancel01Icon, color: "text-destructive", bgColor: "bg-destructive/10" },
    tracking_updated: { icon: DeliveryTruck01Icon, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    invoice_generated: { icon: Invoice01Icon, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    invoice_sent: { icon: Mail01Icon, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    note_added: { icon: NoteIcon, color: "text-muted-foreground", bgColor: "bg-muted" },
    email_sent: { icon: Mail01Icon, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    status_changed: { icon: Clock01Icon, color: "text-chart-4", bgColor: "bg-chart-4/10" },
};

export function OrderTimelineCard({ order }: OrderTimelineCardProps) {
    // Combine events with order creation
    const allEvents: OrderEvent[] = [
        ...order.events,
        {
            id: "created",
            orderId: order.id,
            type: "order_created" as const,
            message: "Order placed",
            createdAt: order.createdAt,
        },
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" />
                    Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                    {/* Events */}
                    <div className="space-y-4">
                        {allEvents.map((event, index) => (
                            <TimelineEvent
                                key={event.id}
                                event={event}
                                isLast={index === allEvents.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TimelineEvent({ event, isLast }: { event: OrderEvent; isLast: boolean }) {
    const config = eventConfig[event.type] || eventConfig.order_updated;
    const EventIcon = config.icon;

    return (
        <div className="relative flex gap-3 pl-1">
            {/* Icon */}
            <div
                className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    config.bgColor
                )}
            >
                <HugeiconsIcon icon={EventIcon} className={cn("h-4 w-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
                <p className="text-sm font-medium">{event.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </span>
                    {event.userName && (
                        <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <HugeiconsIcon icon={UserIcon} className="h-3 w-3" />
                                {event.userName}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
