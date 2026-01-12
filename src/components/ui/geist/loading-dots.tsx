"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const loadingDotsVariants = cva("inline-flex items-center gap-1", {
  variants: {
    size: {
      sm: "gap-0.5",
      md: "gap-1",
      lg: "gap-1.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const dotVariants = cva(
  "rounded-full bg-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-100)] animate-loading-dot",
  {
    variants: {
      size: {
        sm: "size-1", // 4px
        md: "size-1.5", // 6px
        lg: "size-2", // 8px
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface LoadingDotsProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loadingDotsVariants> {
  /** Accessible label for screen readers */
  label?: string;
}

const LoadingDots = React.forwardRef<HTMLSpanElement, LoadingDotsProps>(
  ({ className, size = "md", label = "Loading", ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(loadingDotsVariants({ size }), className)}
        {...props}
      >
        <span
          className={cn(dotVariants({ size }), "animation-delay-0")}
          style={{ animationDelay: "0ms" }}
          aria-hidden="true"
        />
        <span
          className={cn(dotVariants({ size }), "animation-delay-160")}
          style={{ animationDelay: "160ms" }}
          aria-hidden="true"
        />
        <span
          className={cn(dotVariants({ size }), "animation-delay-320")}
          style={{ animationDelay: "320ms" }}
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);
LoadingDots.displayName = "LoadingDots";

export { LoadingDots, loadingDotsVariants };
