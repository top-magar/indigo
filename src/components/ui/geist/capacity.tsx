"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const capacityVariants = cva(
  "flex gap-0.5",
  {
    variants: {
      size: {
        sm: "h-1.5", // 6px
        md: "h-2",   // 8px
        lg: "h-3",   // 12px
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const segmentVariants = cva(
  "flex-1 rounded-sm transition-colors duration-200",
  {
    variants: {
      state: {
        empty: "bg-muted",
        green: "bg-[oklch(0.627_0.194_149.214)]",
        amber: "bg-[oklch(0.769_0.188_70.08)]",
        red: "bg-[oklch(0.577_0.245_27.325)]",
      },
    },
    defaultVariants: {
      state: "empty",
    },
  }
)

export interface CapacityProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof capacityVariants> {
  /** Current value */
  value: number
  /** Maximum limit */
  limit: number
  /** Number of segments to display */
  segments?: number
}

const Capacity = React.forwardRef<HTMLDivElement, CapacityProps>(
  ({ className, value, limit, size = "md", segments = 10, ...props }, ref) => {
    // Calculate percentage and determine color
    const percentage = limit > 0 ? Math.min(100, Math.max(0, (value / limit) * 100)) : 0
    const filledSegments = Math.round((percentage / 100) * segments)
    
    // Determine color based on percentage thresholds
    const getSegmentColor = (index: number): "empty" | "green" | "amber" | "red" => {
      if (index >= filledSegments) return "empty"
      
      if (percentage >= 80) return "red"
      if (percentage >= 60) return "amber"
      return "green"
    }

    return (
      <div
        ref={ref}
        className={cn(capacityVariants({ size }), className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${Math.round(percentage)}% capacity used (${value} of ${limit})`}
        {...props}
      >
        {Array.from({ length: segments }, (_, index) => (
          <div
            key={index}
            className={cn(segmentVariants({ state: getSegmentColor(index) }))}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }
)
Capacity.displayName = "Capacity"

export { Capacity, capacityVariants }
