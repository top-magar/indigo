"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const gaugeVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "size-12", // 48px
        md: "size-16", // 64px
        lg: "size-24", // 96px
      },
      color: {
        blue: "[--gauge-color:oklch(0.546_0.245_262.881)]",
        green: "[--gauge-color:oklch(0.627_0.194_149.214)]",
        red: "[--gauge-color:oklch(0.577_0.245_27.325)]",
        amber: "[--gauge-color:oklch(0.769_0.188_70.08)]",
      },
    },
    defaultVariants: {
      size: "md",
      color: "blue",
    },
  }
)

const sizeConfig = {
  sm: { size: 48, strokeWidth: 4, fontSize: "text-xs" },
  md: { size: 64, strokeWidth: 5, fontSize: "text-sm" },
  lg: { size: 96, strokeWidth: 6, fontSize: "text-lg" },
} as const

export interface GaugeProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "color">,
    VariantProps<typeof gaugeVariants> {
  /** Value from 0 to 100 */
  value: number
  /** Whether to show the value in the center */
  showValue?: boolean
}

const Gauge = React.forwardRef<SVGSVGElement, GaugeProps>(
  ({ className, value, size = "md", color = "blue", showValue = false, ...props }, ref) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value))
    
    const config = sizeConfig[size || "md"]
    const radius = (config.size - config.strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference
    const center = config.size / 2

    return (
      <div
        className={cn(gaugeVariants({ size, color }), className)}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clampedValue}% complete`}
      >
        <svg
          ref={ref}
          width={config.size}
          height={config.size}
          viewBox={`0 0 ${config.size} ${config.size}`}
          fill="none"
          className="transform -rotate-90"
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={config.strokeWidth}
            className="stroke-muted"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={config.strokeWidth}
            stroke="var(--gauge-color)"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        {showValue && (
          <span
            className={cn(
              "absolute font-medium text-foreground",
              config.fontSize
            )}
            aria-hidden="true"
          >
            {Math.round(clampedValue)}
          </span>
        )}
      </div>
    )
  }
)
Gauge.displayName = "Gauge"

export { Gauge, gaugeVariants }
