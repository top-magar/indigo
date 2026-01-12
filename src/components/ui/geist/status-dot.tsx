"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const statusDotVariants = cva(
  "inline-block shrink-0 rounded-full",
  {
    variants: {
      status: {
        success: "bg-[oklch(0.627_0.194_149.214)]",
        error: "bg-[oklch(0.577_0.245_27.325)]",
        warning: "bg-[oklch(0.769_0.188_70.08)]",
        info: "bg-[oklch(0.546_0.245_262.881)]",
        neutral: "bg-muted-foreground",
        building: "bg-[oklch(0.769_0.188_70.08)]",
      },
      size: {
        sm: "size-1.5", // 6px
        md: "size-2",   // 8px
        lg: "size-2.5", // 10px
      },
    },
    defaultVariants: {
      status: "neutral",
      size: "md",
    },
  }
)

const statusLabels: Record<string, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Information",
  neutral: "Neutral",
  building: "Building",
}

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  /** Whether the dot should pulse (auto-enabled for building status) */
  pulse?: boolean
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status = "neutral", size = "md", pulse, ...props }, ref) => {
    // Auto-enable pulse for building status
    const shouldPulse = pulse ?? status === "building"
    const statusLabel = statusLabels[status || "neutral"]

    return (
      <span
        ref={ref}
        role="status"
        aria-label={statusLabel}
        className={cn(
          statusDotVariants({ status, size }),
          shouldPulse && "animate-pulse",
          className
        )}
        {...props}
      />
    )
  }
)
StatusDot.displayName = "StatusDot"

export { StatusDot, statusDotVariants }
