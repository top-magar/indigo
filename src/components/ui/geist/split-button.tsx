"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils";
import { Spinner } from "./spinner";

// ============================================================================
// Variants
// ============================================================================

const splitButtonContainerVariants = cva(
  "inline-flex overflow-hidden transition-opacity",
  {
    variants: {
      size: {
        small: "rounded-md",
        medium: "rounded-lg",
        large: "rounded-lg",
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      size: "medium",
      disabled: false,
    },
  }
);

const splitButtonPrimaryVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)]",
    "dark:bg-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)]",
    "border-none cursor-pointer",
    "transition-colors duration-150 ease-out",
    "hover:bg-[var(--ds-gray-900)] dark:hover:bg-[var(--ds-gray-200)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-gray-700)] focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        small: "px-3 h-8 text-xs [&_svg]:size-3.5",
        medium: "px-4 h-10 text-sm [&_svg]:size-4",
        large: "px-5 h-12 text-base [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

const splitButtonDividerVariants = cva(
  "w-px bg-[var(--ds-gray-800)] dark:bg-[var(--ds-gray-300)]",
  {
    variants: {
      size: {
        small: "h-8",
        medium: "h-10",
        large: "h-12",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

const splitButtonTriggerVariants = cva(
  [
    "inline-flex items-center justify-center",
    "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)]",
    "dark:bg-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)]",
    "border-none cursor-pointer",
    "transition-colors duration-150 ease-out",
    "hover:bg-[var(--ds-gray-900)] dark:hover:bg-[var(--ds-gray-200)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-gray-700)] focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=open]:bg-[var(--ds-gray-900)] dark:data-[state=open]:bg-[var(--ds-gray-200)]",
  ],
  {
    variants: {
      size: {
        small: "w-7 h-8 [&_svg]:size-3.5",
        medium: "w-9 h-10 [&_svg]:size-4",
        large: "w-11 h-12 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

const splitButtonMenuContentVariants = cva(
  [
    "z-50 min-w-[180px] overflow-hidden",
    "rounded-lg border border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)]",
    "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)]",
    "p-1 shadow-lg",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",
  ],
  {
    variants: {
      size: {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

const splitButtonMenuItemVariants = cva(
  [
    "relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer select-none outline-none",
    "text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
    "transition-colors duration-100",
    "focus:bg-[var(--ds-gray-100)] dark:focus:bg-[var(--ds-gray-800)]",
    "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
  ],
  {
    variants: {
      destructive: {
        true: [
          "text-[var(--ds-red-900)] dark:text-[var(--ds-red-400)]",
          "focus:bg-[var(--ds-red-100)] dark:focus:bg-[var(--ds-red-900)]/20",
          "focus:text-[var(--ds-red-900)] dark:focus:text-[var(--ds-red-400)]",
        ],
        false: "",
      },
      size: {
        small: "text-xs py-1.5 [&_svg]:size-3.5",
        medium: "text-sm py-2 [&_svg]:size-4",
        large: "text-base py-2.5 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      destructive: false,
      size: "medium",
    },
  }
);

// ============================================================================
// Types
// ============================================================================

export interface SplitButtonPrimaryAction {
  /** Label text for the primary button */
  label: string;
  /** Click handler for the primary action */
  onClick: () => void;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Whether the primary action is disabled */
  disabled?: boolean;
}

export interface SplitButtonMenuItem {
  /** Label text for the menu item */
  label: string;
  /** Click handler for the menu item */
  onClick: () => void;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Whether the menu item is destructive (red styling) */
  destructive?: boolean;
}

export interface SplitButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof splitButtonContainerVariants> {
  /** Primary action configuration */
  primaryAction: SplitButtonPrimaryAction;
  /** Array of menu items for the dropdown */
  menuItems: SplitButtonMenuItem[];
  /** Alignment of the dropdown menu */
  menuAlignment?: "left" | "right";
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Whether the entire split button is disabled */
  disabled?: boolean;
  /** Whether the split button is in a loading state */
  loading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  (
    {
      className,
      primaryAction,
      menuItems,
      menuAlignment = "right",
      size = "medium",
      disabled = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const isPrimaryDisabled = isDisabled || primaryAction.disabled;

    return (
      <div
        ref={ref}
        className={cn(
          splitButtonContainerVariants({ size, disabled: isDisabled }),
          className
        )}
        data-slot="split-button"
        data-size={size}
        data-loading={loading}
        data-disabled={isDisabled}
        {...props}
      >
        {/* Primary Action Button */}
        <button
          type="button"
          className={cn(splitButtonPrimaryVariants({ size }))}
          onClick={primaryAction.onClick}
          disabled={isPrimaryDisabled}
          aria-disabled={isPrimaryDisabled}
          data-slot="split-button-primary"
        >
          {loading ? (
            <Spinner
              size={size === "large" ? "default" : "small"}
              inverted
              label="Loading"
            />
          ) : (
            <>
              {primaryAction.icon && (
                <span
                  className="shrink-0"
                  data-slot="split-button-primary-icon"
                >
                  {primaryAction.icon}
                </span>
              )}
              <span data-slot="split-button-primary-label">
                {primaryAction.label}
              </span>
            </>
          )}
        </button>

        {/* Divider */}
        <div
          className={cn(splitButtonDividerVariants({ size }))}
          data-slot="split-button-divider"
          aria-hidden="true"
        />

        {/* Dropdown Menu */}
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger
            className={cn(splitButtonTriggerVariants({ size }))}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label="More actions"
            data-slot="split-button-trigger"
          >
            <ChevronDown
              className={cn(
                "transition-transform duration-200",
                "data-[state=open]:rotate-180"
              )}
              aria-hidden="true"
            />
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              className={cn(splitButtonMenuContentVariants({ size }))}
              align={menuAlignment === "left" ? "start" : "end"}
              sideOffset={4}
              data-slot="split-button-menu"
            >
              {menuItems.map((item, index) => (
                <DropdownMenuPrimitive.Item
                  key={index}
                  className={cn(
                    splitButtonMenuItemVariants({
                      destructive: item.destructive,
                      size,
                    })
                  )}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  data-slot="split-button-menu-item"
                  data-destructive={item.destructive}
                >
                  {item.icon && (
                    <span
                      className="shrink-0"
                      data-slot="split-button-menu-item-icon"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span data-slot="split-button-menu-item-label">
                    {item.label}
                  </span>
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
    );
  }
);
SplitButton.displayName = "SplitButton";

// ============================================================================
// Exports
// ============================================================================

export {
  SplitButton,
  splitButtonContainerVariants,
  splitButtonPrimaryVariants,
  splitButtonDividerVariants,
  splitButtonTriggerVariants,
  splitButtonMenuContentVariants,
  splitButtonMenuItemVariants,
};
