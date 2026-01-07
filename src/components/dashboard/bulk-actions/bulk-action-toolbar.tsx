"use client";

import { type ReactNode, useMemo } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  MoreHorizontalIcon,
  Delete02Icon,
  Download04Icon,
  Edit02Icon,
  FolderOpenIcon,
  PrinterIcon,
  Mail01Icon,
  Tag01Icon,
  Archive02Icon,
  DollarCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  type BulkActionConfig,
  type BulkActionContext,
  BulkActionType,
  getBulkActionsForContext,
} from "./bulk-action-types";

/**
 * Icon mapping for bulk action types
 */
const ACTION_ICONS: Record<BulkActionType, typeof Cancel01Icon> = {
  [BulkActionType.DELETE]: Delete02Icon,
  [BulkActionType.EXPORT]: Download04Icon,
  [BulkActionType.UPDATE_STATUS]: Edit02Icon,
  [BulkActionType.ASSIGN_CATEGORY]: FolderOpenIcon,
  [BulkActionType.UPDATE_PRICE]: DollarCircleIcon,
  [BulkActionType.ARCHIVE]: Archive02Icon,
  [BulkActionType.PRINT_LABELS]: PrinterIcon,
  [BulkActionType.SEND_EMAIL]: Mail01Icon,
  [BulkActionType.ADD_TAG]: Tag01Icon,
};

interface BulkActionToolbarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback to clear selection */
  onClear: () => void;
  /** Context for determining available actions */
  context?: BulkActionContext;
  /** Custom actions (overrides context-based actions) */
  actions?: BulkActionConfig[];
  /** Callback when an action is triggered */
  onAction: (actionType: BulkActionType) => void;
  /** Item label (singular) */
  itemLabel?: string;
  /** Whether to show keyboard shortcuts */
  showShortcuts?: boolean;
  /** Whether to use sticky positioning */
  sticky?: boolean;
  /** Additional class names */
  className?: string;
  /** Custom action buttons to render */
  children?: ReactNode;
  /** Whether a bulk operation is in progress */
  isLoading?: boolean;
  /** Currently loading action type */
  loadingAction?: BulkActionType | null;
}

/**
 * Enhanced toolbar for bulk actions when items are selected
 * Supports context-based actions, keyboard shortcuts, and sticky positioning
 *
 * @example
 * ```tsx
 * <BulkActionToolbar
 *   selectedCount={selectedCount}
 *   onClear={clearSelection}
 *   context="orders"
 *   onAction={(type) => handleBulkAction(type)}
 *   showShortcuts
 *   sticky
 * />
 * ```
 */
export function BulkActionToolbar({
  selectedCount,
  onClear,
  context,
  actions: customActions,
  onAction,
  itemLabel = "item",
  showShortcuts = true,
  sticky = false,
  className,
  children,
  isLoading = false,
  loadingAction = null,
}: BulkActionToolbarProps) {
  // Get actions based on context or use custom actions
  const actions = useMemo(() => {
    if (customActions) return customActions;
    if (context) return getBulkActionsForContext(context);
    return [];
  }, [customActions, context]);

  // Split actions into primary and dropdown
  const { primaryActions, dropdownActions } = useMemo(() => {
    const primary = actions.filter((a) => !a.showInDropdown);
    const dropdown = actions.filter((a) => a.showInDropdown);
    return { primaryActions: primary, dropdownActions: dropdown };
  }, [actions]);

  if (selectedCount === 0) return null;

  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`;

  const toolbarContent = (
    <>
      {/* Selection count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} {pluralLabel} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
          onClick={onClear}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-border" />

      {/* Primary Actions */}
      <div className="flex items-center gap-2">
        {primaryActions.map((action) => (
          <ActionButton
            key={action.type}
            action={action}
            onAction={onAction}
            showShortcut={showShortcuts}
            isLoading={isLoading && loadingAction === action.type}
            disabled={isLoading}
          />
        ))}

        {/* Custom children */}
        {children}

        {/* Dropdown for more actions */}
        {dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8" disabled={isLoading}>
                {isLoading && loadingAction && dropdownActions.some(a => a.type === loadingAction) ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                )}
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {dropdownActions.map((action, index) => (
                <div key={action.type}>
                  {index > 0 && action.destructive && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onAction(action.type)}
                    disabled={action.disabled || isLoading}
                    variant={action.destructive ? "destructive" : "default"}
                  >
                    {isLoading && loadingAction === action.type ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <HugeiconsIcon
                        icon={ACTION_ICONS[action.type]}
                        className="w-4 h-4 mr-2"
                      />
                    )}
                    {action.label}
                    {showShortcuts && action.shortcut && (
                      <Kbd className="ml-auto">{action.shortcut}</Kbd>
                    )}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );

  if (sticky) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-3 px-4 py-3 rounded-full",
          "bg-background/95 backdrop-blur border shadow-lg",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        {toolbarContent}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        "bg-muted/50 border",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200",
        className
      )}
    >
      {toolbarContent}
    </div>
  );
}

/**
 * Individual action button with tooltip and shortcut
 */
function ActionButton({
  action,
  onAction,
  showShortcut,
  isLoading = false,
  disabled = false,
}: {
  action: BulkActionConfig;
  onAction: (type: BulkActionType) => void;
  showShortcut: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  const Icon = ACTION_ICONS[action.type];

  const button = (
    <Button
      variant={action.destructive ? "destructive" : "outline"}
      size="sm"
      className="h-8"
      onClick={() => onAction(action.type)}
      disabled={action.disabled || disabled}
    >
      {isLoading ? (
        <Spinner className="w-4 h-4 mr-1.5" />
      ) : (
        <HugeiconsIcon icon={Icon} className="w-4 h-4 mr-1.5" />
      )}
      {action.label}
    </Button>
  );

  if (showShortcut && action.shortcut) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <span>{action.label}</span>
          <Kbd className="ml-2">{action.shortcut}</Kbd>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

BulkActionToolbar.displayName = "BulkActionToolbar";
