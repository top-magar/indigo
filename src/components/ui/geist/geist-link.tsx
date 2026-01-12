"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/shared/utils";

const geistLinkVariants = cva(
  "inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
  {
    variants: {
      variant: {
        default:
          "text-[var(--ds-blue-700)] dark:text-[var(--ds-blue-400)] hover:text-[var(--ds-blue-800)] dark:hover:text-[var(--ds-blue-300)]",
        subtle:
          "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)] hover:text-[var(--ds-gray-1000)] dark:hover:text-[var(--ds-gray-100)]",
        underline:
          "text-[var(--ds-blue-700)] dark:text-[var(--ds-blue-400)] hover:text-[var(--ds-blue-800)] dark:hover:text-[var(--ds-blue-300)] underline underline-offset-2 decoration-[var(--ds-blue-400)] dark:decoration-[var(--ds-blue-600)] hover:decoration-[var(--ds-blue-600)] dark:hover:decoration-[var(--ds-blue-400)]",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const externalIconVariants = cva("flex-shrink-0", {
  variants: {
    size: {
      sm: "size-3",
      md: "size-3.5",
      lg: "size-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface GeistLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof geistLinkVariants> {
  /** Whether the link opens in a new tab */
  external?: boolean;
}

const GeistLink = React.forwardRef<HTMLAnchorElement, GeistLinkProps>(
  (
    { className, variant = "default", size = "md", external = false, children, ...props },
    ref
  ) => {
    const externalProps = external
      ? {
          target: "_blank",
          rel: "noopener noreferrer",
        }
      : {};

    return (
      <a
        ref={ref}
        className={cn(geistLinkVariants({ variant, size }), className)}
        {...externalProps}
        {...props}
      >
        {children}
        {external && (
          <ArrowUpRight
            className={cn(externalIconVariants({ size }))}
            aria-hidden="true"
          />
        )}
      </a>
    );
  }
);
GeistLink.displayName = "GeistLink";

export { GeistLink, geistLinkVariants };
