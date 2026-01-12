"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const spinnerVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      small: "size-4", // 16px
      default: "size-5", // 20px
      large: "size-6", // 24px
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Custom size in pixels (overrides size variant) */
  customSize?: number;
  /** Spinner color (defaults to currentColor) */
  color?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Use light color for dark backgrounds */
  inverted?: boolean;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      className,
      size = "default",
      customSize,
      color,
      label = "Loading",
      inverted = false,
      style,
      ...props
    },
    ref
  ) => {
    // Calculate dimensions
    const sizeMap = {
      small: 16,
      default: 20,
      large: 24,
    };
    const dimension = customSize ?? sizeMap[size ?? "default"];

    // Determine color
    const spinnerColor = color
      ? color
      : inverted
        ? "var(--ds-background-100)"
        : "currentColor";

    return (
      <span
        role="status"
        aria-label={label}
        className={cn(
          spinnerVariants({ size: customSize ? undefined : size }),
          className
        )}
      >
        <svg
          ref={ref}
          width={dimension}
          height={dimension}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "animate-spin motion-reduce:animate-none",
            "duration-[800ms]"
          )}
          style={{
            ...style,
            color: spinnerColor,
          }}
          aria-hidden="true"
          {...props}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-20"
          />
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 14.5361 2.94409 16.8517 4.5 18.6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className={cn(
              "motion-reduce:opacity-100",
              "[stroke-dasharray:90,150]",
              "[stroke-dashoffset:0]"
            )}
          />
        </svg>
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
