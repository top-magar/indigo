"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-[var(--ds-gray-alpha-400)]",
  {
    variants: {
      size: {
        small: "h-1",
        medium: "h-1.5",
        large: "h-2",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
)

const progressBarVariants = cva(
  "h-full rounded-full transition-all duration-300 ease-out",
  {
    variants: {
      dynamicState: {
        low: "bg-[var(--ds-red-700)]",
        medium: "bg-[var(--ds-amber-700)]",
        high: "bg-[var(--ds-green-700)]",
        default: "bg-[var(--ds-blue-700)]",
      },
    },
    defaultVariants: {
      dynamicState: "default",
    },
  }
)

export interface ProgressStop {
  /** Position of the stop (0-100 or relative to max) */
  value: number
  /** Optional label for the stop */
  label?: string
}

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof progressVariants> {
  /** Current progress value */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Progress bar color (CSS color value) */
  color?: string
  /** Track background color (CSS color value) */
  backgroundColor?: string
  /** Display percentage text */
  showValue?: boolean
  /** Array of stop/milestone positions */
  stops?: ProgressStop[]
  /** Enable automatic color based on value thresholds */
  dynamicColor?: boolean
  /** Custom thresholds for dynamic colors [low, medium] (default: [33, 66]) */
  thresholds?: [number, number]
}

function getDynamicState(
  percentage: number,
  thresholds: [number, number]
): "low" | "medium" | "high" {
  if (percentage < thresholds[0]) return "low"
  if (percentage < thresholds[1]) return "medium"
  return "high"
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      color,
      backgroundColor,
      size = "medium",
      showValue = false,
      stops,
      dynamicColor = false,
      thresholds = [33, 66],
      ...props
    },
    ref
  ) => {
    const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
    const dynamicState = dynamicColor
      ? getDynamicState(percentage, thresholds)
      : "default"

    const containerStyle: React.CSSProperties = backgroundColor
      ? { backgroundColor }
      : {}

    const barStyle: React.CSSProperties = {
      width: `${percentage}%`,
      ...(color && !dynamicColor ? { backgroundColor: color } : {}),
    }

    return (
      <div className={cn("relative", showValue && "flex items-center gap-2")}>
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          style={containerStyle}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${Math.round(percentage)}% progress`}
          {...props}
        >
          <div
            className={cn(progressBarVariants({ dynamicState }))}
            style={barStyle}
          />
          {stops && stops.length > 0 && (
            <div className="absolute inset-0">
              {stops.map((stop, index) => {
                const stopPercentage =
                  max > 0 ? Math.min(100, Math.max(0, (stop.value / max) * 100)) : 0
                return (
                  <div
                    key={index}
                    className="absolute top-0 h-full w-0.5 bg-[var(--ds-background-100)]"
                    style={{ left: `${stopPercentage}%` }}
                    aria-hidden="true"
                    title={stop.label}
                  />
                )
              })}
            </div>
          )}
        </div>
        {showValue && (
          <span
            className="text-sm font-medium text-[var(--ds-gray-700)] tabular-nums"
            aria-hidden="true"
          >
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress, progressVariants, progressBarVariants }
