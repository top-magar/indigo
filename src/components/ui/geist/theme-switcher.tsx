"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/shared/utils";

const themeSwitcherVariants = cva("", {
  variants: {
    variant: {
      buttons: "inline-flex items-center rounded-lg border border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)] p-0.5 bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-900)]",
      dropdown: "relative",
    },
  },
  defaultVariants: {
    variant: "buttons",
  },
});

const themeButtonVariants = cva(
  "inline-flex items-center justify-center rounded-sm p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      active: {
        true: "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-800)] text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)] shadow-sm",
        false: "text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-900)] dark:hover:text-[var(--ds-gray-200)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export type ThemeValue = "light" | "dark" | "system";

export interface ThemeSwitcherProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof themeSwitcherVariants> {
  /** Current theme value */
  value: ThemeValue;
  /** Callback when theme changes */
  onChange: (value: ThemeValue) => void;
}

const themes: { value: ThemeValue; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const ThemeSwitcher = React.forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ className, variant = "buttons", value, onChange, ...props }, ref) => {
    if (variant === "dropdown") {
      return (
        <div
          ref={ref}
          className={cn(themeSwitcherVariants({ variant }), className)}
          {...props}
        >
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as ThemeValue)}
            className={cn(
              "appearance-none rounded-lg border border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-800)]",
              "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)]",
              "text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
              "px-3 py-1.5 pr-8 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "cursor-pointer"
            )}
            aria-label="Select theme"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="size-4 text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-500)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Theme selection"
        className={cn(themeSwitcherVariants({ variant }), className)}
        {...props}
      >
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isActive = value === theme.value;

          return (
            <button
              key={theme.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={theme.label}
              onClick={() => onChange(theme.value)}
              className={cn(themeButtonVariants({ active: isActive }))}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    );
  }
);
ThemeSwitcher.displayName = "ThemeSwitcher";

export { ThemeSwitcher, themeSwitcherVariants };
