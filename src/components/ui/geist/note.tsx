"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, CheckCircle, XCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils";

const noteVariants = cva("flex items-start gap-3 rounded-md border transition-colors", {
  variants: {
    type: {
      default: "border-[var(--ds-gray-400)] bg-[var(--ds-gray-100)] text-[var(--ds-gray-1000)] dark:border-[var(--ds-gray-700)] dark:bg-[var(--ds-gray-200)]",
      success: "border-[var(--ds-green-600)] bg-[var(--ds-green-100)] text-[var(--ds-green-900)] dark:border-[var(--ds-green-700)] dark:text-[var(--ds-green-1000)]",
      error: "border-[var(--ds-red-600)] bg-[var(--ds-red-100)] text-[var(--ds-red-900)] dark:border-[var(--ds-red-700)] dark:text-[var(--ds-red-1000)]",
      warning: "border-[var(--ds-amber-600)] bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)] dark:border-[var(--ds-amber-700)] dark:text-[var(--ds-amber-1000)]",
      secondary: "border-[var(--ds-gray-300)] bg-[var(--ds-background-200)] text-[var(--ds-gray-900)] dark:border-[var(--ds-gray-600)] dark:bg-[var(--ds-gray-100)]",
      violet: "border-[var(--ds-purple-600)] bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)] dark:border-[var(--ds-purple-700)] dark:text-[var(--ds-purple-1000)]",
      cyan: "border-[var(--ds-teal-600)] bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)] dark:border-[var(--ds-teal-700)] dark:text-[var(--ds-teal-1000)]",
      tertiary: "border-[var(--ds-gray-200)] bg-transparent text-[var(--ds-gray-800)] dark:border-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]",
      alert: "border-[var(--ds-red-700)] bg-[var(--ds-red-100)] text-[var(--ds-red-900)] dark:border-[var(--ds-red-600)] dark:text-[var(--ds-red-1000)]",
      lite: "border-transparent bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-200)] dark:text-[var(--ds-gray-800)]",
      ghost: "border-transparent bg-transparent text-[var(--ds-gray-800)] dark:text-[var(--ds-gray-400)]",
    },
    size: {
      small: "px-3 py-2 text-xs",
      medium: "px-4 py-3 text-sm",
      large: "px-5 py-4 text-base",
    },
    fill: { true: "", false: "" },
    disabled: { true: "opacity-50 pointer-events-none", false: "" },
  },
  compoundVariants: [
    { type: "success", fill: true, className: "bg-[var(--ds-green-700)] border-[var(--ds-green-700)] text-white dark:bg-[var(--ds-green-700)] dark:border-[var(--ds-green-700)] dark:text-white" },
    { type: "error", fill: true, className: "bg-[var(--ds-red-700)] border-[var(--ds-red-700)] text-white dark:bg-[var(--ds-red-700)] dark:border-[var(--ds-red-700)] dark:text-white" },
    { type: "warning", fill: true, className: "bg-[var(--ds-amber-600)] border-[var(--ds-amber-600)] text-white dark:bg-[var(--ds-amber-700)] dark:border-[var(--ds-amber-700)] dark:text-white" },
    { type: "default", fill: true, className: "bg-[var(--ds-gray-900)] border-[var(--ds-gray-900)] text-white dark:bg-[var(--ds-gray-100)] dark:border-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)]" },
    { type: "violet", fill: true, className: "bg-[var(--ds-purple-700)] border-[var(--ds-purple-700)] text-white dark:bg-[var(--ds-purple-700)] dark:border-[var(--ds-purple-700)] dark:text-white" },
    { type: "cyan", fill: true, className: "bg-[var(--ds-teal-700)] border-[var(--ds-teal-700)] text-white dark:bg-[var(--ds-teal-700)] dark:border-[var(--ds-teal-700)] dark:text-white" },
    { type: "alert", fill: true, className: "bg-[var(--ds-red-700)] border-[var(--ds-red-700)] text-white dark:bg-[var(--ds-red-600)] dark:border-[var(--ds-red-600)] dark:text-white" },
  ],
  defaultVariants: { type: "default", size: "medium", fill: false, disabled: false },
});

const noteLabelVariants = cva("font-semibold uppercase tracking-wide shrink-0", {
  variants: { size: { small: "text-[10px]", medium: "text-[11px]", large: "text-xs" } },
  defaultVariants: { size: "medium" },
});

const noteIconVariants = cva("shrink-0 mt-0.5", {
  variants: { size: { small: "size-3.5", medium: "size-4", large: "size-5" } },
  defaultVariants: { size: "medium" },
});

export type NoteType = "default" | "success" | "error" | "warning" | "secondary" | "violet" | "cyan" | "tertiary" | "alert" | "lite" | "ghost";

export interface NoteProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof noteVariants> {
  type?: NoteType;
  label?: string | false;
  action?: React.ReactNode;
}


const defaultLabels: Record<NoteType, string> = {
  default: "Note", success: "Success", error: "Error", warning: "Warning",
  secondary: "Note", violet: "Note", cyan: "Note", tertiary: "Note",
  alert: "Alert", lite: "Note", ghost: "Note",
};

const typeIcons: Record<NoteType, React.ComponentType<{ className?: string }>> = {
  default: Info, success: CheckCircle, error: XCircle, warning: AlertTriangle,
  secondary: Info, violet: Info, cyan: Info, tertiary: Info,
  alert: AlertCircle, lite: Info, ghost: Info,
};

const Note = React.forwardRef<HTMLDivElement, NoteProps>(
  ({ className, type = "default", size = "medium", fill = false, disabled = false, label, action, children, ...props }, ref) => {
    const Icon = typeIcons[type];
    const showLabel = label !== false;
    const labelText = label === undefined ? defaultLabels[type] : label;

    return (
      <div
        ref={ref}
        role={type === "error" || type === "alert" ? "alert" : "note"}
        className={cn(noteVariants({ type, size, fill, disabled }), className)}
        {...props}
      >
        <Icon className={cn(noteIconVariants({ size }))} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {showLabel && labelText && (
            <span className={cn(noteLabelVariants({ size }), "mr-1.5")}>{labelText}:</span>
          )}
          <span className="leading-relaxed">{children}</span>
        </div>
        {action && <div className="shrink-0 ml-auto">{action}</div>}
      </div>
    );
  }
);
Note.displayName = "Note";

export { Note, noteVariants, noteLabelVariants, noteIconVariants };
