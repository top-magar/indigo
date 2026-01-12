"use client";

import { formatDistanceToNow } from "date-fns";
import {
    User,
    ShoppingCart,
    StickyNote,
    MapPin,
    Mail,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils";
import type { Customer, TimelineEvent, TimelineEventType } from "@/app/dashboard/customers/types";

interface CustomerTimelineCardProps {
    customer: Customer;
}

const eventConfig: Record<TimelineEventType, { 
    icon: typeof User; 
    color: string; 
    bgColor: string;
}> = {
    customer_created: { icon: User, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    customer_updated: { icon: User, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    order_placed: { icon: ShoppingCart, color: "text-chart-1", bgColor: "bg-chart-1/10" },
    order_fulfilled: { icon: CheckCircle2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    order_cancelled: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
    note_added: { icon: StickyNote, color: "text-chart-4", bgColor: "bg-chart-4/10" },
    address_added: { icon: MapPin, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    address_updated: { icon: MapPin, color: "text-chart-5", bgColor: "bg-chart-5/10" },
    marketing_subscribed: { icon: Mail, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    marketing_unsubscribed: { icon: Mail, color: "text-muted-foreground", bgColor: "bg-muted" },
    account_activated: { icon: CheckCircle2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
    account_deactivated: { icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
};

export function CustomerTimelineCard({ customer }: CustomerTimelineCardProps) {
    // Build timeline from available data
    const events: TimelineEvent[] = [];

    // Add customer creation
    events.push({
        id: "created",
        type: "customer_created",
        message: "Customer account created",
        date: customer.dateJoined,
    });

    // Add orders
    customer.recentOrders.forEach(order => {
        events.push({
            id: `order-${order.id}`,
            type: "order_placed",
            message: `Placed order #${order.orderNumber}`,
            date: order.createdAt,
            metadata: { orderId: order.id },
        });
    });

    // Add notes
    customer.notes.forEach(note => {
        events.push({
            id: note.id,
            type: "note_added",
            message: note.text.length > 50 ? `${note.text.slice(0, 50)}...` : note.text,
            date: note.createdAt,
            user: note.createdBy,
        });
    });

    // Sort by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit to 10 events
    const displayEvents = events.slice(0, 10);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {displayEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No activity yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        {displayEvents.map((event, index) => {
                            const config = eventConfig[event.type];
                            const Icon = config.icon;
                            
                            return (
                                <div key={event.id} className="flex gap-3">
                                    <div className="relative">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            config.bgColor
                                        )}>
                                            <Icon className={cn("w-4 h-4", config.color)} />
                                        </div>
                                        {index < displayEvents.length - 1 && (
                                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className="text-sm truncate">{event.message}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                                            </p>
                                            {event.user && (
                                                <>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <p className="text-xs text-muted-foreground">{event.user}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
