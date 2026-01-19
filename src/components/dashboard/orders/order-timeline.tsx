"use client"

import { format, formatDistanceToNow } from "date-fns"
import {
    CheckCircle,
    Clock,
    Truck,
    Package,
    X,
    ShoppingCart,
    CreditCard,
    Mail,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"

export interface TimelineEvent {
    id: string
    type: "created" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled" | "payment" | "note"
    title: string
    description?: string
    timestamp: string
    user?: string
}

interface OrderTimelineProps {
    events: TimelineEvent[]
}

const eventConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
    created: {
        icon: ShoppingCart,
        color: "text-[color:var(--ds-blue-700)]",
        bgColor: "bg-[var(--ds-blue-100)]",
    },
    confirmed: {
        icon: CheckCircle,
        color: "text-[color:var(--ds-green-700)]",
        bgColor: "bg-[var(--ds-green-100)]",
    },
    processing: {
        icon: Package,
        color: "text-[color:var(--ds-purple-700)]",
        bgColor: "bg-[var(--ds-purple-100)]",
    },
    shipped: {
        icon: Truck,
        color: "text-[color:var(--ds-blue-700)]",
        bgColor: "bg-[var(--ds-blue-100)]",
    },
    delivered: {
        icon: CheckCircle,
        color: "text-[color:var(--ds-green-700)]",
        bgColor: "bg-[var(--ds-green-100)]",
    },
    completed: {
        icon: CheckCircle,
        color: "text-[color:var(--ds-green-700)]",
        bgColor: "bg-[var(--ds-green-100)]",
    },
    cancelled: {
        icon: X,
        color: "text-[color:var(--ds-red-700)]",
        bgColor: "bg-[var(--ds-red-100)]",
    },
    payment: {
        icon: CreditCard,
        color: "text-[color:var(--ds-amber-700)]",
        bgColor: "bg-[var(--ds-amber-100)]",
    },
    note: {
        icon: Mail,
        color: "text-[color:var(--ds-gray-700)]",
        bgColor: "bg-[var(--ds-gray-100)]",
    },
}

export function OrderTimeline({ events }: OrderTimelineProps) {
    if (events.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                No activity recorded
            </p>
        )
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
                {events.map((event, index) => {
                    const config = eventConfig[event.type] || eventConfig.note
                    const isFirst = index === 0

                    return (
                        <div key={event.id} className="relative flex gap-3 pl-0">
                            {/* Icon */}
                            <div
                                className={cn(
                                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                    config.bgColor,
                                    isFirst && "ring-2 ring-background"
                                )}
                            >
                                <config.icon
                                    className={cn("h-4 w-4", config.color)}
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-medium">{event.title}</p>
                                        {event.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                    <time
                                        className="text-xs text-muted-foreground whitespace-nowrap"
                                        title={format(new Date(event.timestamp), "PPP 'at' p")}
                                    >
                                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                    </time>
                                </div>
                                {event.user && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        by {event.user}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Helper to generate timeline events from order data
export function generateOrderTimeline(order: {
    created_at: string
    updated_at?: string
    status: string
    payment_status?: string
    notes?: string
}): TimelineEvent[] {
    const events: TimelineEvent[] = []

    // Order created
    events.push({
        id: "created",
        type: "created",
        title: "Order placed",
        description: "Customer completed checkout",
        timestamp: order.created_at,
    })

    // Payment received (if paid)
    if (order.payment_status === "paid") {
        events.push({
            id: "payment",
            type: "payment",
            title: "Payment received",
            description: "Payment confirmed",
            timestamp: order.created_at, // Assume same time as order for now
        })
    }

    // Current status (if not pending)
    if (order.status !== "pending") {
        const statusTitles: Record<string, string> = {
            confirmed: "Order confirmed",
            processing: "Processing started",
            shipped: "Order shipped",
            delivered: "Order delivered",
            completed: "Order completed",
            cancelled: "Order cancelled",
        }

        const statusDescriptions: Record<string, string> = {
            confirmed: "Order has been confirmed and is being prepared",
            processing: "Order is being processed",
            shipped: "Package is on its way",
            delivered: "Package has been delivered",
            completed: "Order has been completed",
            cancelled: "Order has been cancelled",
        }

        events.push({
            id: `status-${order.status}`,
            type: order.status as TimelineEvent["type"],
            title: statusTitles[order.status] || `Status: ${order.status}`,
            description: statusDescriptions[order.status],
            timestamp: order.updated_at || order.created_at,
        })
    }

    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
}
