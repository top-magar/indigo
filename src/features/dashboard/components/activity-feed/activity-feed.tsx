"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export interface ActivityItem {
  id: string;
  type: "order" | "product" | "customer" | "review";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const typeIcons: Record<string, string> = {
  order: "🛒",
  product: "📦",
  customer: "👤",
  review: "⭐",
};

export function ActivityFeed({ activities, maxItems = 8, className }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{typeIcons[item.type] || "📋"}</span>
                <div className="flex-1 min-w-0">
                  {item.href ? (
                    <Link href={item.href} className="text-xs font-medium hover:underline truncate block">
                      {item.title}
                    </Link>
                  ) : (
                    <p className="text-xs font-medium truncate">{item.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
