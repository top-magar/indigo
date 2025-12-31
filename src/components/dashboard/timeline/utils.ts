import { 
  isToday, 
  isYesterday, 
  differenceInDays, 
  parseISO 
} from "date-fns";
import type { DateGroupKey } from "./types";

export interface DateGroup<T> {
  key: DateGroupKey;
  label: string;
  events: T[];
}

/**
 * Get the date group key for a given date
 */
export function getDateGroupKey(date: Date | string): DateGroupKey {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();

  if (isToday(d)) return "TODAY";
  if (isYesterday(d)) return "YESTERDAY";
  
  const daysDiff = differenceInDays(now, d);
  if (daysDiff <= 7) return "LAST_7_DAYS";
  if (daysDiff <= 30) return "LAST_30_DAYS";
  
  return "OLDER";
}

/**
 * Get human-readable label for date group
 */
export function getDateGroupLabel(key: DateGroupKey): string {
  const labels: Record<DateGroupKey, string> = {
    TODAY: "Today",
    YESTERDAY: "Yesterday",
    LAST_7_DAYS: "Last 7 days",
    LAST_30_DAYS: "Last 30 days",
    OLDER: "Older",
  };
  return labels[key];
}

/**
 * Group events by date category
 * Inspired by Saleor's OrderHistory grouping
 */
export function groupEventsByDate<T extends { date: Date | string }>(
  events: T[]
): DateGroup<T>[] {
  const groups: Map<DateGroupKey, T[]> = new Map();
  const order: DateGroupKey[] = ["TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "OLDER"];

  // Initialize groups
  order.forEach((key) => groups.set(key, []));

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = typeof a.date === "string" ? parseISO(a.date) : a.date;
    const dateB = typeof b.date === "string" ? parseISO(b.date) : b.date;
    return dateB.getTime() - dateA.getTime();
  });

  // Group events
  sortedEvents.forEach((event) => {
    const key = getDateGroupKey(event.date);
    groups.get(key)?.push(event);
  });

  // Return only non-empty groups
  return order
    .filter((key) => (groups.get(key)?.length ?? 0) > 0)
    .map((key) => ({
      key,
      label: getDateGroupLabel(key),
      events: groups.get(key) || [],
    }));
}

/**
 * Format relative time for timeline events
 */
export function formatEventTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
