"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Use the same icon type pattern as empty-state
type HugeIcon = typeof MoreHorizontalIcon;

export interface ActionMenuItem {
  label: string;
  icon?: HugeIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  variant?: "default" | "destructive";
}

export interface ActionMenuGroup {
  actions: ActionMenuItem[];
}

interface ActionMenuProps {
  groups: ActionMenuGroup[];
  trigger?: React.ReactNode;
  variant?: "ghost" | "outline";
  size?: "sm" | "default" | "icon";
  align?: "start" | "center" | "end";
  className?: string;
}

export function ActionMenu({
  groups,
  trigger,
  variant = "ghost",
  size = "icon",
  align = "end",
  className,
}: ActionMenuProps) {
  const defaultTrigger = (
    <Button variant={variant} size={size} className={cn("h-8 w-8", className)}>
      <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {groups.map((group, groupIndex) => {
          if (!group.actions.length) return null;

          const isLast = groupIndex === groups.length - 1;

          return (
            <React.Fragment key={groupIndex}>
              {group.actions.map((action, actionIndex) => {
                const menuItem = (
                  <DropdownMenuItem
                    key={actionIndex}
                    disabled={action.disabled}
                    onClick={(e) => {
                      if (action.onClick) {
                        e.stopPropagation();
                        action.onClick();
                      }
                    }}
                    className={cn(
                      "gap-2 cursor-pointer",
                      action.variant === "destructive" && "text-destructive focus:text-destructive"
                    )}
                    asChild={!!action.href && !action.disabled}
                  >
                    {action.href && !action.disabled ? (
                      <Link href={action.href} onClick={(e) => e.stopPropagation()}>
                        {action.icon && (
                          <HugeiconsIcon
                            icon={action.icon}
                            className={cn(
                              "w-4 h-4",
                              action.disabled && "opacity-50"
                            )}
                          />
                        )}
                        <span>{action.label}</span>
                      </Link>
                    ) : (
                      <>
                        {action.icon && (
                          <HugeiconsIcon
                            icon={action.icon}
                            className={cn(
                              "w-4 h-4",
                              action.disabled && "opacity-50"
                            )}
                          />
                        )}
                        <span>{action.label}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                );

                // Wrap with tooltip if disabled and has tooltip
                if (action.disabled && action.disabledTooltip) {
                  return (
                    <TooltipProvider key={actionIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{menuItem}</div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{action.disabledTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return menuItem;
              })}
              {!isLast && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convenience component for simple action menus
interface SimpleActionMenuProps {
  actions: ActionMenuItem[];
  trigger?: React.ReactNode;
  variant?: "ghost" | "outline";
  align?: "start" | "center" | "end";
  className?: string;
}

export function SimpleActionMenu({ actions, ...props }: SimpleActionMenuProps) {
  return <ActionMenu groups={[{ actions }]} {...props} />;
}
