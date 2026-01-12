"use client";

import {
    Clock,
    CheckCircle,
    X,
    CreditCard,
    Package,
    Truck,
    Mail,
    StickyNote,
    FileText,
    User,
    type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { Order, OrderEvent, OrderEventType } from "@/features/orders/types";
import { cn } from "@/shared/utils";

interface OrderTimelineCardProps {
    order: Order;
}

const eventConfig: Record<OrderEventType, { icon: LucideIcon; color: string; bgColor: string }> = {
    order_created: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    order_confirmed: { icon: CheckCircle, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    order_cancelled: { icon: X, color: "text-destructive", bgColor: "bg-destructive/10" },
    order_updated: { icon: Clock, color: "text-chart-4", bgColor: "bg-chart-4/10" },
    payment_authorized: { icon: CreditCard, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    payment_captured: { icon: CreditCard, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    payment_refunded: { icon: CreditCard, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    payment_voided: { icon: CreditCard, color: "text-muted-foreground", bgColor: "bg-muted" },
    payment_failed: { icon: CreditCard, color: "text-destructive", bgColor: "bg-destructive/10" },
    fulfillment_created: { icon: Package, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    fulfillment_approved: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    fulfillment_shipped: { icon: Truck, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    fulfillment_delivered: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    fulfillment_cancelled: { icon: X, color: "text-destructive", bgColor: "bg-destructive/10" },
    tracking_updated: { icon: Truck, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    invoice_generated: { icon: FileText, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    invoice_sent: { icon: Mail, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    note_added: { icon: StickyNote, color: "text-muted-foreground", bgColor: "bg-muted" },
    email_sent: { icon: Mail, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    status_changed: { icon: Clock, color: "text-chart-4", bgColor: "bg-chart-4/10" },
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
                    <Clock className="h-5 w-5" />
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
                <EventIcon className={cn("h-4 w-4", config.color)} />
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
                                <User className="h-3 w-3" />
                                {event.userName}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
