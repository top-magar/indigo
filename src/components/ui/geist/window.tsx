"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";
import { BRAND_COLORS } from "@/config/brand-colors";

const windowVariants = cva(
  "rounded-xl overflow-hidden border shadow-lg",
  {
    variants: {
      variant: {
        default: "border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)]",
        dark: "border-[var(--ds-gray-800)] dark:border-[var(--ds-gray-600)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const windowTitleBarVariants = cva(
  "flex items-center h-10 px-4 border-b",
  {
    variants: {
      variant: {
        default: "bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-300)] dark:border-[var(--ds-gray-700)]",
        dark: "bg-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-950)] border-[var(--ds-gray-800)] dark:border-[var(--ds-gray-700)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const windowContentVariants = cva(
  "overflow-auto",
  {
    variants: {
      variant: {
        default: "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-950)]",
        dark: "bg-[var(--ds-gray-950)] dark:bg-[var(--ds-gray-1000)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface WindowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof windowVariants> {
  title?: string;
  dark?: boolean;
  showControls?: boolean;
}

const TrafficLights = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    aria-hidden="true"
    {...props}
  >
    <div 
      className="size-3 rounded-full transition-colors hover:opacity-80" 
      style={{ backgroundColor: BRAND_COLORS.macosClose }}
    />
    <div 
      className="size-3 rounded-full transition-colors hover:opacity-80" 
      style={{ backgroundColor: BRAND_COLORS.macosMinimize }}
    />
    <div 
      className="size-3 rounded-full transition-colors hover:opacity-80" 
      style={{ backgroundColor: BRAND_COLORS.macosMaximize }}
    />
  </div>
));
TrafficLights.displayName = "TrafficLights";

const WindowTitleBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    showControls?: boolean;
    variant?: "default" | "dark";
  }
>(({ className, title, showControls = true, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(windowTitleBarVariants({ variant }), className)}
    {...props}
  >
    {showControls && <TrafficLights />}
    {title && (
      <span
        className={cn(
          "flex-1 text-center text-sm font-medium truncate",
          variant === "dark"
            ? "text-[var(--ds-gray-100)]"
            : "text-[var(--ds-gray-900)] dark:text-[var(--ds-gray-100)]"
        )}
      >
        {title}
      </span>
    )}
    {showControls && <div className="w-[52px]" aria-hidden="true" />}
  </div>
));
WindowTitleBar.displayName = "WindowTitleBar";

const WindowContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "dark";
  }
>(({ className, variant = "default", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(windowContentVariants({ variant }), className)}
    {...props}
  >
    {children}
  </div>
));
WindowContent.displayName = "WindowContent";

const Window = React.forwardRef<HTMLDivElement, WindowProps>(
  ({ className, title, dark = false, showControls = true, children, ...props }, ref) => {
    const variant = dark ? "dark" : "default";

    return (
      <div
        ref={ref}
        role="region"
        aria-label={title || "Window"}
        className={cn(windowVariants({ variant }), className)}
        {...props}
      >
        <WindowTitleBar
          title={title}
          showControls={showControls}
          variant={variant}
        />
        <WindowContent variant={variant}>{children}</WindowContent>
      </div>
    );
  }
);
Window.displayName = "Window";

export { Window, WindowTitleBar, WindowContent, TrafficLights, windowVariants };
