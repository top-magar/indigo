"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, User, Package, AlertCircle, CheckCircle2, Clock, type LucideIcon } from "lucide-react";
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

const typeIcon: Record<string, LucideIcon> = {
  order: ShoppingCart,
  customer: User,
  product: Package,
  alert: AlertCircle,
  success: CheckCircle2,
};

function ActivityItemRow({ activity }: { activity: ActivityItem }) {
  const Icon = typeIcon[activity.type] || ShoppingCart;
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });

  const content = (
    <div className="flex items-start gap-3 py-2.5">
      <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium truncate">{activity.title}</p>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activity.description}</p>
        {activity.metadata?.amount && (
          <span className="text-xs font-medium mt-0.5 inline-block">{activity.metadata.amount}</span>
        )}
      </div>
    </div>
  );

  if (activity.href) {
    return <Link href={activity.href} className="block hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors">{content}</Link>;
  }
  return content;
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayed = activities.slice(0, maxItems);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-[-0.32px]">Activity</CardTitle>
          {activities.length > maxItems && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/activity">
                View all <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <Clock className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Activity will show up as your store grows</p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/dashboard/products/new">
                Add your first product <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {displayed.map((a) => (
              <ActivityItemRow key={a.id} activity={a} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
