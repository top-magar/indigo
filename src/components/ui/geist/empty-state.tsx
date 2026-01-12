"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const emptyStateVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    variant: {
      blank: "py-8 px-4",
      informational: "py-12 px-6",
      educational: "py-16 px-8",
      guide: "py-12 px-6",
    },
    size: { sm: "max-w-xs", md: "max-w-sm", lg: "max-w-md" },
  },
  defaultVariants: { variant: "informational", size: "md" },
});

const emptyStateTitleVariants = cva("font-semibold text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-1000)]", {
  variants: {
    variant: { blank: "text-base", informational: "text-lg", educational: "text-xl", guide: "text-lg" },
  },
  defaultVariants: { variant: "informational" },
});

const emptyStateDescriptionVariants = cva("text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-600)] leading-relaxed", {
  variants: {
    variant: { blank: "text-sm mt-1", informational: "text-sm mt-2", educational: "text-base mt-3", guide: "text-sm mt-2" },
  },
  defaultVariants: { variant: "informational" },
});

const emptyStateIllustrationVariants = cva("text-[var(--ds-gray-400)] dark:text-[var(--ds-gray-600)]", {
  variants: {
    variant: { blank: "mb-3 [&_svg]:size-10", informational: "mb-4 [&_svg]:size-12", educational: "mb-6 [&_svg]:size-16", guide: "mb-4 [&_svg]:size-12" },
  },
  defaultVariants: { variant: "informational" },
});

const emptyStateActionsVariants = cva("flex flex-col items-center gap-3", {
  variants: { variant: { blank: "mt-4", informational: "mt-6", educational: "mt-8", guide: "mt-6" } },
  defaultVariants: { variant: "informational" },
});

export type EmptyStateVariant = "blank" | "informational" | "educational" | "guide";
export interface EmptyStateAction { label: string; onClick?: () => void; href?: string; }
export interface EmptyStateLink { label: string; href: string; }


export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  link?: EmptyStateLink;
  illustration?: React.ReactNode;
  variant?: EmptyStateVariant;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant = "informational", size = "md", title, description, action, secondaryAction, link, illustration, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(emptyStateVariants({ variant, size }), "mx-auto", className)} {...props}>
        {illustration && (
          <div className={cn(emptyStateIllustrationVariants({ variant }))} aria-hidden="true">
            {illustration}
          </div>
        )}
        <h3 className={cn(emptyStateTitleVariants({ variant }))}>{title}</h3>
        {description && <p className={cn(emptyStateDescriptionVariants({ variant }))}>{description}</p>}
        {(action || secondaryAction || link) && (
          <div className={cn(emptyStateActionsVariants({ variant }))}>
            {(action || secondaryAction) && (
              <div className="flex items-center gap-2">
                {action && <EmptyStateActionButton action={action} primary />}
                {secondaryAction && <EmptyStateActionButton action={secondaryAction} />}
              </div>
            )}
            {link && (
              <a href={link.href} className="text-sm text-[var(--ds-blue-700)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2 rounded-sm">
                {link.label}
              </a>
            )}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";


interface EmptyStateActionButtonProps { action: EmptyStateAction; primary?: boolean; }

function EmptyStateActionButton({ action, primary = false }: EmptyStateActionButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
    "transition-colors focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50"
  );
  const variantClasses = primary
    ? "bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] hover:bg-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)] dark:hover:bg-[var(--ds-gray-200)]"
    : "border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-100)] dark:border-[var(--ds-gray-700)] dark:bg-[var(--ds-gray-200)] dark:text-[var(--ds-gray-1000)] dark:hover:bg-[var(--ds-gray-300)]";

  if (action.href) {
    return <a href={action.href} className={cn(baseClasses, variantClasses)}>{action.label}</a>;
  }
  return <button type="button" onClick={action.onClick} className={cn(baseClasses, variantClasses)}>{action.label}</button>;
}

export { EmptyState, emptyStateVariants, emptyStateTitleVariants, emptyStateDescriptionVariants, emptyStateIllustrationVariants, emptyStateActionsVariants };
