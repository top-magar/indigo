"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InboxIcon } from "@hugeicons/core-free-icons";

type HugeIcon = typeof InboxIcon;

interface EmptyStateProps {
  icon?: HugeIcon;
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
  icon = InboxIcon,
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
        <HugeiconsIcon
          icon={icon}
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
