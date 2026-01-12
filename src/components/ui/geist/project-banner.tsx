"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/shared/utils";

const projectBannerVariants = cva(
  "relative flex items-center gap-3 px-4 py-3 w-full",
  {
    variants: {
      variant: {
        info: "bg-[var(--ds-blue-100)] dark:bg-[var(--ds-blue-900)] text-[var(--ds-blue-900)] dark:text-[var(--ds-blue-100)] border-b border-[var(--ds-blue-300)] dark:border-[var(--ds-blue-700)]",
        warning:
          "bg-[var(--ds-amber-100)] dark:bg-[var(--ds-amber-900)] text-[var(--ds-amber-900)] dark:text-[var(--ds-amber-100)] border-b border-[var(--ds-amber-300)] dark:border-[var(--ds-amber-700)]",
        error:
          "bg-[var(--ds-red-100)] dark:bg-[var(--ds-red-900)] text-[var(--ds-red-900)] dark:text-[var(--ds-red-100)] border-b border-[var(--ds-red-300)] dark:border-[var(--ds-red-700)]",
        success:
          "bg-[var(--ds-green-100)] dark:bg-[var(--ds-green-900)] text-[var(--ds-green-900)] dark:text-[var(--ds-green-100)] border-b border-[var(--ds-green-300)] dark:border-[var(--ds-green-700)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const projectBannerIconVariants = cva("flex-shrink-0", {
  variants: {
    variant: {
      info: "text-[var(--ds-blue-700)] dark:text-[var(--ds-blue-400)]",
      warning: "text-[var(--ds-amber-700)] dark:text-[var(--ds-amber-400)]",
      error: "text-[var(--ds-red-700)] dark:text-[var(--ds-red-400)]",
      success: "text-[var(--ds-green-700)] dark:text-[var(--ds-green-400)]",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const projectBannerDismissVariants = cva(
  "flex-shrink-0 inline-flex items-center justify-center size-6 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        info: "hover:bg-[var(--ds-blue-200)] dark:hover:bg-[var(--ds-blue-800)] focus-visible:ring-[var(--ds-blue-700)]",
        warning:
          "hover:bg-[var(--ds-amber-200)] dark:hover:bg-[var(--ds-amber-800)] focus-visible:ring-[var(--ds-amber-700)]",
        error:
          "hover:bg-[var(--ds-red-200)] dark:hover:bg-[var(--ds-red-800)] focus-visible:ring-[var(--ds-red-700)]",
        success:
          "hover:bg-[var(--ds-green-200)] dark:hover:bg-[var(--ds-green-800)] focus-visible:ring-[var(--ds-green-700)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface ProjectBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof projectBannerVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

type BannerVariant = "info" | "warning" | "error" | "success" | null | undefined;

const getDefaultIcon = (variant: BannerVariant) => {
  switch (variant) {
    case "warning":
      return <AlertTriangle className="size-5" aria-hidden="true" />;
    case "error":
      return <AlertCircle className="size-5" aria-hidden="true" />;
    case "success":
      return (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "info":
    default:
      return <Info className="size-5" aria-hidden="true" />;
  }
};

const ProjectBannerIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "info" | "warning" | "error" | "success";
  }
>(({ className, variant = "info", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(projectBannerIconVariants({ variant }), className)}
    {...props}
  >
    {children || getDefaultIcon(variant)}
  </div>
));
ProjectBannerIcon.displayName = "ProjectBannerIcon";

const ProjectBannerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 min-w-0", className)}
    {...props}
  >
    {children}
  </div>
));
ProjectBannerContent.displayName = "ProjectBannerContent";

const ProjectBannerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  >
    {children}
  </p>
));
ProjectBannerTitle.displayName = "ProjectBannerTitle";

const ProjectBannerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  >
    {children}
  </p>
));
ProjectBannerDescription.displayName = "ProjectBannerDescription";

const ProjectBannerAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-shrink-0", className)}
    {...props}
  >
    {children}
  </div>
));
ProjectBannerAction.displayName = "ProjectBannerAction";

const ProjectBannerDismiss = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "info" | "warning" | "error" | "success";
  }
>(({ className, variant = "info", ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(projectBannerDismissVariants({ variant }), className)}
    aria-label="Dismiss banner"
    {...props}
  >
    <X className="size-4" aria-hidden="true" />
  </button>
));
ProjectBannerDismiss.displayName = "ProjectBannerDismiss";

const ProjectBanner = React.forwardRef<HTMLDivElement, ProjectBannerProps>(
  (
    {
      className,
      variant,
      title,
      description,
      action,
      onDismiss,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedVariant = variant ?? "info";
    
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(projectBannerVariants({ variant: resolvedVariant }), className)}
        {...props}
      >
        <ProjectBannerIcon variant={resolvedVariant}>{icon}</ProjectBannerIcon>
        <ProjectBannerContent>
          {title && <ProjectBannerTitle>{title}</ProjectBannerTitle>}
          {description && (
            <ProjectBannerDescription>{description}</ProjectBannerDescription>
          )}
          {children}
        </ProjectBannerContent>
        {action && <ProjectBannerAction>{action}</ProjectBannerAction>}
        {onDismiss && (
          <ProjectBannerDismiss variant={resolvedVariant} onClick={onDismiss} />
        )}
      </div>
    );
  }
);
ProjectBanner.displayName = "ProjectBanner";

export {
  ProjectBanner,
  ProjectBannerIcon,
  ProjectBannerContent,
  ProjectBannerTitle,
  ProjectBannerDescription,
  ProjectBannerAction,
  ProjectBannerDismiss,
  projectBannerVariants,
};
