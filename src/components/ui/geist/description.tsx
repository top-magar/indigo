"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const descriptionVariants = cva("flex flex-col", {
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

const descriptionTitleVariants = cva(
  "font-semibold text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const descriptionContentVariants = cva(
  "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface DescriptionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof descriptionVariants> {
  /** Title text displayed above the description */
  title: string;
  /** Description content */
  children: React.ReactNode;
}

const Description = React.forwardRef<HTMLDivElement, DescriptionProps>(
  ({ className, title, size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(descriptionVariants({ size }), className)}
        {...props}
      >
        <dt className={cn(descriptionTitleVariants({ size }))}>{title}</dt>
        <dd className={cn(descriptionContentVariants({ size }))}>{children}</dd>
      </div>
    );
  }
);
Description.displayName = "Description";

export { Description, descriptionVariants };
