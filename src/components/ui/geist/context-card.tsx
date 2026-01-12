"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const contextCardVariants = cva(
  "rounded-lg border p-4 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)]",
        elevated:
          "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-300)] dark:border-[var(--ds-gray-700)] shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contextCardTitleVariants = cva(
  "text-sm font-medium mb-3",
  {
    variants: {
      variant: {
        default: "text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-400)]",
        elevated: "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-300)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contextCardOptionVariants = cva(
  "flex-1 px-3 py-2 rounded-md border text-sm font-medium transition-all cursor-pointer text-center",
  {
    variants: {
      selected: {
        true: "border-[var(--ds-gray-1000)] dark:border-[var(--ds-gray-100)] bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-800)] text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
        false:
          "border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-700)] bg-transparent text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-300)] hover:border-[var(--ds-gray-400)] dark:hover:border-[var(--ds-gray-500)]",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export interface ContextCardOption {
  /** Unique value for the option */
  value: string;
  /** Display label for the option */
  label: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
}

export interface ContextCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof contextCardVariants> {
  /** Card title/heading */
  title?: string;
  /** Array of selectable options */
  options?: ContextCardOption[];
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Custom content to render below options */
  children?: React.ReactNode;
}

const ContextCard = React.forwardRef<HTMLDivElement, ContextCardProps>(
  (
    {
      className,
      variant = "default",
      title,
      options,
      value,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(contextCardVariants({ variant }), className)}
        {...props}
      >
        {title && (
          <h3 className={cn(contextCardTitleVariants({ variant }))}>{title}</h3>
        )}

        {options && options.length > 0 && (
          <div
            role="radiogroup"
            aria-label={title || "Options"}
            className="flex gap-2"
          >
            {options.map((option) => {
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onChange?.(option.value)}
                  className={cn(contextCardOptionVariants({ selected: isSelected }))}
                >
                  {option.icon && (
                    <span className="mr-2 inline-flex" aria-hidden="true">
                      {option.icon}
                    </span>
                  )}
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {children && (
          <div className={cn(options && options.length > 0 && "mt-4")}>
            {children}
          </div>
        )}
      </div>
    );
  }
);
ContextCard.displayName = "ContextCard";

export { ContextCard, contextCardVariants, contextCardOptionVariants };
