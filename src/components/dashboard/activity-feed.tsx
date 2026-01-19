"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowRight,
  ShoppingCart,
  User,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export interface ActivityItem {
  id: string;
  type: "order" | "customer" | "product" | "alert" | "success";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  metadata?: {
    customerName?: string;
    orderNumber?: string;
    amount?: string;
  };
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const ACTIVITY_CONFIG = {
  order: {
    icon: ShoppingCart,
    color: "chart-1",
    bgColor: "bg-[var(--ds-chart-1)]/10",
    textColor: "text-[var(--ds-chart-1)]",
  },
  customer: {
    icon: User,
    color: "chart-4",
    bgColor: "bg-[var(--ds-chart-4)]/10",
    textColor: "text-[var(--ds-chart-4)]",
  },
  product: {
    icon: Package,
    color: "chart-5",
    bgColor: "bg-[var(--ds-chart-5)]/10",
    textColor: "text-[var(--ds-chart-5)]",
  },
  alert: {
    icon: AlertCircle,
    color: "red-600",
    bgColor: "bg-[var(--ds-red-100)]",
    textColor: "text-[var(--ds-red-800)]",
  },
  success: {
    icon: CheckCircle2,
    color: "chart-2",
    bgColor: "bg-[var(--ds-chart-2)]/10",
    textColor: "text-[var(--ds-chart-2)]",
  },
};

function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const config = ACTIVITY_CONFIG[activity.type];
  const Icon = config.icon;

  const content = (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-[var(--ds-gray-100)] transition-all duration-200 group">
      {/* Icon */}
      <div
        className={`h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
      >
        <Icon className={`w-5 h-5 ${config.textColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-[var(--ds-gray-900)] group-hover:text-[var(--ds-brand-600)] transition-colors">
            {activity.title}
          </p>
          <span className="text-xs text-[var(--ds-gray-500)] shrink-0">
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-xs text-[var(--ds-gray-600)] line-clamp-2">
          {activity.description}
        </p>
        {activity.metadata && (
          <div className="flex items-center gap-2 mt-2">
            {activity.metadata.orderNumber && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] border-0"
              >
                {activity.metadata.orderNumber}
              </Badge>
            )}
            {activity.metadata.amount && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-[var(--ds-chart-2)]/10 text-[var(--ds-chart-2)] border-0"
              >
                {activity.metadata.amount}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      {activity.href && (
        <ArrowRight className="w-4 h-4 text-[var(--ds-gray-400)] group-hover:text-[var(--ds-brand-600)] group-hover:translate-x-1 transition-all shrink-0" />
      )}
    </div>
  );

  if (activity.href) {
    return (
      <Link href={activity.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[var(--ds-gray-100)] flex items-center justify-center mb-4">
        <TrendingUp className="w-8 h-8 text-[var(--ds-gray-400)]" />
      </div>
      <p className="text-sm text-[var(--ds-gray-800)] font-medium">
        No recent activity
      </p>
      <p className="text-xs text-[var(--ds-gray-600)] mt-1 max-w-xs">
        Activity from orders, customers, and products will appear here
      </p>
    </div>
  );
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-[var(--ds-gray-900)]">
              Recent Activity
            </CardTitle>
            <p className="text-xs text-[var(--ds-gray-600)] mt-0.5">
              Latest updates from your store
            </p>
          </div>
          {activities.length > maxItems && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/activity"
                className="text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {displayedActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {displayedActivities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
