"use client";

import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    UserAdd01Icon,
    PackageIcon,
    Money01Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export interface ActivityItem {
    id: string;
    type: "order_placed" | "order_completed" | "order_cancelled" | "customer_joined" | "product_sold" | "payment_received";
    title: string;
    description: string;
    timestamp: string;
    metadata?: {
        amount?: number;
        currency?: string;
        orderNumber?: string;
        customerName?: string;
        productName?: string;
    };
}

const activityConfig = {
    order_placed: {
        icon: ShoppingCart01Icon,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
    },
    order_completed: {
        icon: CheckmarkCircle02Icon,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
    },
    order_cancelled: {
        icon: Cancel01Icon,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
    },
    customer_joined: {
        icon: UserAdd01Icon,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
    },
    product_sold: {
        icon: PackageIcon,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
    },
    payment_received: {
        icon: Money01Icon,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
    },
};

interface ActivityFeedProps {
    activities: ActivityItem[];
    maxItems?: number;
    className?: string;
}

export function ActivityFeed({ activities, maxItems = 5, className }: ActivityFeedProps) {
    const displayActivities = activities.slice(0, maxItems);

    if (displayActivities.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
                <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={ShoppingCart01Icon} className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Activity will appear here as it happens</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-1", className)}>
            {displayActivities.map((activity, index) => {
                const config = activityConfig[activity.type];
                const isLast = index === displayActivities.length - 1;

                return (
                    <div key={activity.id} className="relative flex gap-3 pb-3">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                        )}
                        
                        {/* Icon */}
                        <div className={cn(
                            "relative z-10 h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                            config.bgColor
                        )}>
                            <HugeiconsIcon icon={config.icon} className={cn("w-4 h-4", config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
