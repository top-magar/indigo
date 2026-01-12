"use client";

import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Inbox, Search, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "py-6",
        size === "md" && "py-12",
        size === "lg" && "py-20",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          size === "sm" && "h-10 w-10",
          size === "md" && "h-12 w-12",
          size === "lg" && "h-16 w-16"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            size === "sm" && "w-5 h-5",
            size === "md" && "w-6 h-6",
            size === "lg" && "w-8 h-8"
          )}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground mt-1 max-w-sm",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className={cn("flex items-center gap-2", size === "sm" ? "mt-3" : "mt-4")}>
          {action && (
            <Button size={size === "lg" ? "default" : "sm"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size={size === "lg" ? "default" : "sm"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// NoResults variant - specifically for search/filter results
interface NoResultsProps {
  title?: string;
  message?: string;
  onClear?: () => void;
  className?: string;
}

export function NoResults({
  title = "No results found",
  message = "Try adjusting your search or filters",
  onClear,
  className,
}: NoResultsProps) {
  return (
    <div
      className={cn(
        "flex h-[300px] w-full flex-col items-center justify-center gap-y-3",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-y-1 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}

// NoRecords variant - for empty collections
interface NoRecordsProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function NoRecords({
  icon: Icon = Inbox,
  title = "No records yet",
  message = "Get started by creating your first record",
  action,
  className,
}: NoRecordsProps) {
  return (
    <div
      className={cn(
        "flex h-[200px] w-full flex-col items-center justify-center gap-y-4",
        className
      )}
    >
      <div className="flex flex-col items-center gap-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border bg-background">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col items-center gap-y-1 text-center">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? <a href={action.href}>{action.label}</a> : action.label}
        </Button>
      )}
    </div>
  );
}
