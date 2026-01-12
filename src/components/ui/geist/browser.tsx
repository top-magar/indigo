"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";
import { BRAND_COLORS } from "@/config/brand-colors";

const browserVariants = cva("rounded-lg overflow-hidden border", {
  variants: {
    variant: {
      light:
        "bg-[var(--ds-background-100)] border-[var(--ds-gray-200)] dark:bg-[var(--ds-gray-900)] dark:border-[var(--ds-gray-700)]",
      dark:
        "bg-[var(--ds-gray-900)] border-[var(--ds-gray-700)] dark:bg-[var(--ds-gray-950)] dark:border-[var(--ds-gray-800)]",
    },
    shadow: {
      true: "shadow-lg",
      false: "",
    },
  },
  defaultVariants: {
    variant: "light",
    shadow: true,
  },
});

const browserHeaderVariants = cva("flex items-center gap-3 px-4 py-3 border-b", {
  variants: {
    variant: {
      light:
        "bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-200)] dark:border-[var(--ds-gray-700)]",
      dark:
        "bg-[var(--ds-gray-800)] dark:bg-[var(--ds-gray-900)] border-[var(--ds-gray-700)] dark:border-[var(--ds-gray-800)]",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

const browserAddressBarVariants = cva("flex-1 px-3 py-1.5 rounded-md text-sm truncate", {
  variants: {
    variant: {
      light:
        "bg-[var(--ds-gray-200)] dark:bg-[var(--ds-gray-800)] text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-400)]",
      dark:
        "bg-[var(--ds-gray-700)] dark:bg-[var(--ds-gray-800)] text-[var(--ds-gray-400)] dark:text-[var(--ds-gray-500)]",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

const browserContentVariants = cva("overflow-auto", {
  variants: {
    variant: {
      light: "bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-950)]",
      dark: "bg-[var(--ds-gray-950)] dark:bg-[var(--ds-gray-1000)]",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

const BrowserTrafficLights = React.forwardRef<
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
      className="size-3 rounded-full transition-opacity hover:opacity-80"
      style={{ backgroundColor: BRAND_COLORS.macosClose }}
    />
    <div
      className="size-3 rounded-full transition-opacity hover:opacity-80"
      style={{ backgroundColor: BRAND_COLORS.macosMinimize }}
    />
    <div
      className="size-3 rounded-full transition-opacity hover:opacity-80"
      style={{ backgroundColor: BRAND_COLORS.macosMaximize }}
    />
  </div>
));
BrowserTrafficLights.displayName = "BrowserTrafficLights";

const BrowserHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    url?: string;
    showControls?: boolean;
    variant?: "light" | "dark";
  }
>(({ className, url, showControls = true, variant = "light", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(browserHeaderVariants({ variant }), className)}
    {...props}
  >
    {showControls && <BrowserTrafficLights />}
    {url && (
      <div className={cn(browserAddressBarVariants({ variant }))}>
        <span className="select-none">{url}</span>
      </div>
    )}
    {showControls && !url && <div className="flex-1" />}
  </div>
));
BrowserHeader.displayName = "BrowserHeader";

const BrowserContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "light" | "dark";
  }
>(({ className, variant = "light", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(browserContentVariants({ variant }), className)}
    {...props}
  >
    {children}
  </div>
));
BrowserContent.displayName = "BrowserContent";

export interface BrowserProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof browserVariants> {
  /** URL to display in the address bar */
  url?: string;
  /** Show macOS-style window control buttons */
  showControls?: boolean;
  /** Browser frame variant */
  variant?: "light" | "dark";
  /** Show shadow around the browser frame */
  shadow?: boolean;
}

/**
 * Browser component - A browser frame mockup for showcasing websites
 *
 * @example
 * ```tsx
 * <Browser url="https://vercel.com" variant="light">
 *   <img src="/screenshot.png" alt="Website screenshot" />
 * </Browser>
 * ```
 */
const Browser = React.forwardRef<HTMLDivElement, BrowserProps>(
  (
    {
      className,
      url,
      showControls = true,
      variant = "light",
      shadow = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={url ? `Browser showing ${url}` : "Browser mockup"}
        className={cn(browserVariants({ variant, shadow }), className)}
        {...props}
      >
        <BrowserHeader url={url} showControls={showControls} variant={variant} />
        <BrowserContent variant={variant}>{children}</BrowserContent>
      </div>
    );
  }
);
Browser.displayName = "Browser";

export {
  Browser,
  BrowserHeader,
  BrowserContent,
  BrowserTrafficLights,
  browserVariants,
};
