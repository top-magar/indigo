"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils";

const errorMessageVariants = cva(
  "flex items-start gap-2 text-[var(--ds-red-700)] dark:text-[var(--ds-red-400)]",
  {
    variants: {
      size: {
        sm: "gap-1.5 text-xs",
        md: "gap-2 text-sm",
        lg: "gap-2.5 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const errorIconVariants = cva("flex-shrink-0 text-[var(--ds-red-700)] dark:text-[var(--ds-red-400)]", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageVariants> {
  /** Error message text */
  message: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Optional action element (e.g., retry button) */
  action?: React.ReactNode;
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, message, label, size = "md", action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        aria-label={label || "Error"}
        className={cn(errorMessageVariants({ size }), className)}
        {...props}
      >
        <AlertCircle
          className={cn(errorIconVariants({ size }), "mt-0.5")}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="leading-tight">{message}</span>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
    );
  }
);
ErrorMessage.displayName = "ErrorMessage";

export { ErrorMessage, errorMessageVariants };
