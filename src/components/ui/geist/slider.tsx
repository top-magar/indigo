"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/shared/utils"

// ============================================================================
// Slider Variants
// ============================================================================

const sliderVariants = cva(
  "relative flex touch-none select-none",
  {
    variants: {
      orientation: {
        horizontal: "w-full items-center",
        vertical: "h-full flex-col justify-center",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      { orientation: "horizontal", size: "sm", className: "h-4" },
      { orientation: "horizontal", size: "md", className: "h-5" },
      { orientation: "horizontal", size: "lg", className: "h-6" },
      { orientation: "vertical", size: "sm", className: "w-4" },
      { orientation: "vertical", size: "md", className: "w-5" },
      { orientation: "vertical", size: "lg", className: "w-6" },
    ],
    defaultVariants: {
      orientation: "horizontal",
      size: "md",
    },
  }
)

const sliderTrackVariants = cva(
  "relative grow overflow-hidden rounded-full bg-[var(--ds-gray-alpha-400)]",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical: "h-full",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      { orientation: "horizontal", size: "sm", className: "h-1" },
      { orientation: "horizontal", size: "md", className: "h-1.5" },
      { orientation: "horizontal", size: "lg", className: "h-2" },
      { orientation: "vertical", size: "sm", className: "w-1" },
      { orientation: "vertical", size: "md", className: "w-1.5" },
      { orientation: "vertical", size: "lg", className: "w-2" },
    ],
    defaultVariants: {
      orientation: "horizontal",
      size: "md",
    },
  }
)

const sliderRangeVariants = cva(
  "absolute rounded-full",
  {
    variants: {
      orientation: {
        horizontal: "h-full",
        vertical: "w-full",
      },
      color: {
        blue: "bg-[var(--ds-blue-900)]",
        green: "bg-[var(--ds-green-900)]",
        red: "bg-[var(--ds-red-900)]",
        amber: "bg-[var(--ds-amber-900)]",
        gray: "bg-[var(--ds-gray-900)]",
      },
      disabled: {
        true: "bg-[var(--ds-gray-600)]",
        false: "",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      color: "blue",
      disabled: false,
    },
  }
)

const sliderThumbVariants = cva(
  "block rounded-full border-2 bg-[var(--ds-background-100)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4",
        lg: "size-5",
      },
      color: {
        blue: "border-[var(--ds-blue-900)]",
        green: "border-[var(--ds-green-900)]",
        red: "border-[var(--ds-red-900)]",
        amber: "border-[var(--ds-amber-900)]",
        gray: "border-[var(--ds-gray-900)]",
      },
      disabled: {
        true: "cursor-not-allowed border-[var(--ds-gray-600)]",
        false: "cursor-grab active:cursor-grabbing hover:border-[var(--ds-blue-700)]",
      },
    },
    compoundVariants: [
      { color: "green", disabled: false, className: "hover:border-[var(--ds-green-700)]" },
      { color: "red", disabled: false, className: "hover:border-[var(--ds-red-700)]" },
      { color: "amber", disabled: false, className: "hover:border-[var(--ds-amber-700)]" },
      { color: "gray", disabled: false, className: "hover:border-[var(--ds-gray-700)]" },
    ],
    defaultVariants: {
      size: "md",
      color: "blue",
      disabled: false,
    },
  }
)

const sliderMarkVariants = cva(
  "absolute bg-[var(--ds-gray-600)]",
  {
    variants: {
      orientation: {
        horizontal: "top-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-1/2",
        vertical: "left-1/2 h-0.5 w-2 -translate-x-1/2 -translate-y-1/2",
      },
      active: {
        true: "bg-[var(--ds-background-100)]",
        false: "",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      active: false,
    },
  }
)

const sliderMarkLabelVariants = cva(
  "absolute text-xs text-[var(--ds-gray-700)] whitespace-nowrap",
  {
    variants: {
      orientation: {
        horizontal: "top-full mt-1 -translate-x-1/2",
        vertical: "left-full ml-2 -translate-y-1/2",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

const sliderTooltipVariants = cva(
  "absolute z-10 rounded-md bg-[var(--ds-gray-1000)] px-2 py-1 text-xs font-medium text-[var(--ds-background-100)] shadow-md",
  {
    variants: {
      orientation: {
        horizontal: "bottom-full mb-2 left-1/2 -translate-x-1/2",
        vertical: "right-full mr-2 top-1/2 -translate-y-1/2",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export interface SliderMark {
  /** Position of the mark (value on the slider) */
  value: number
  /** Optional label for the mark */
  label?: string
}

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, "value" | "defaultValue" | "onValueChange" | "onValueCommit" | "onChange">,
    VariantProps<typeof sliderVariants> {
  /** Current value (controlled) - single number or [min, max] for range */
  value?: number | [number, number]
  /** Default value (uncontrolled) - single number or [min, max] for range */
  defaultValue?: number | [number, number]
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Whether the slider is disabled */
  disabled?: boolean
  /** Orientation of the slider */
  orientation?: "horizontal" | "vertical"
  /** Array of marks to display on the track */
  marks?: SliderMark[]
  /** Whether to show the current value in a tooltip */
  showValue?: boolean
  /** Color theme for the slider */
  color?: "blue" | "green" | "red" | "amber" | "gray"
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Callback when value changes during drag */
  onChange?: (value: number | [number, number]) => void
  /** Callback when value change is committed (drag ends) */
  onChangeEnd?: (value: number | [number, number]) => void
  /** Custom format function for the tooltip value */
  formatValue?: (value: number) => string
}

// ============================================================================
// Helper Components
// ============================================================================

interface SliderThumbWithTooltipProps {
  index: number
  value: number
  showValue: boolean
  orientation: "horizontal" | "vertical"
  size: "sm" | "md" | "lg"
  color: "blue" | "green" | "red" | "amber" | "gray"
  disabled: boolean
  formatValue: (value: number) => string
}

const SliderThumbWithTooltip = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Thumb>,
  SliderThumbWithTooltipProps
>(({ index, value, showValue, orientation, size, color, disabled, formatValue }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const showTooltip = showValue && (isHovered || isDragging)

  return (
    <SliderPrimitive.Thumb
      ref={ref}
      className={cn(sliderThumbVariants({ size, color, disabled }))}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      aria-label={`Slider thumb ${index + 1}`}
    >
      {showTooltip && (
        <div className={cn(sliderTooltipVariants({ orientation }))}>
          {formatValue(value)}
        </div>
      )}
    </SliderPrimitive.Thumb>
  )
})
SliderThumbWithTooltip.displayName = "SliderThumbWithTooltip"

// ============================================================================
// Main Component
// ============================================================================

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      orientation = "horizontal",
      marks,
      showValue = false,
      color = "blue",
      size = "md",
      onChange,
      onChangeEnd,
      formatValue = (v) => String(v),
      ...props
    },
    ref
  ) => {
    // Normalize value to array format for Radix
    const normalizeValue = (val: number | [number, number] | undefined): number[] | undefined => {
      if (val === undefined) return undefined
      return Array.isArray(val) ? val : [val]
    }

    // Convert array back to single value or tuple
    const denormalizeValue = (val: number[]): number | [number, number] => {
      return val.length === 1 ? val[0] : [val[0], val[1]]
    }

    const normalizedValue = normalizeValue(value)
    const normalizedDefaultValue = normalizeValue(defaultValue) ?? [min]

    const [internalValue, setInternalValue] = React.useState<number[]>(normalizedDefaultValue)
    
    const currentValue = normalizedValue ?? internalValue
    const isRange = currentValue.length > 1

    const handleValueChange = (newValue: number[]) => {
      if (!normalizedValue) {
        setInternalValue(newValue)
      }
      onChange?.(denormalizeValue(newValue))
    }

    const handleValueCommit = (newValue: number[]) => {
      onChangeEnd?.(denormalizeValue(newValue))
    }

    // Calculate mark positions and whether they're in the active range
    const getMarkPosition = (markValue: number): number => {
      return ((markValue - min) / (max - min)) * 100
    }

    const isMarkActive = (markValue: number): boolean => {
      if (isRange) {
        return markValue >= currentValue[0] && markValue <= currentValue[1]
      }
      return markValue <= currentValue[0]
    }

    return (
      <div className="relative">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(sliderVariants({ orientation, size }), className)}
          value={currentValue}
          defaultValue={normalizedDefaultValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          orientation={orientation}
          onValueChange={handleValueChange}
          onValueCommit={handleValueCommit}
          {...props}
        >
          <SliderPrimitive.Track
            className={cn(sliderTrackVariants({ orientation, size }))}
          >
            <SliderPrimitive.Range
              className={cn(sliderRangeVariants({ orientation, color, disabled }))}
            />
            {/* Marks on track */}
            {marks?.map((mark, index) => {
              const position = getMarkPosition(mark.value)
              const isActive = isMarkActive(mark.value)
              const style: React.CSSProperties = orientation === "horizontal"
                ? { left: `${position}%` }
                : { bottom: `${position}%` }

              return (
                <div
                  key={index}
                  className={cn(sliderMarkVariants({ orientation, active: isActive }))}
                  style={style}
                  aria-hidden="true"
                />
              )
            })}
          </SliderPrimitive.Track>

          {/* Thumbs */}
          {currentValue.map((val, index) => (
            <SliderThumbWithTooltip
              key={index}
              index={index}
              value={val}
              showValue={showValue}
              orientation={orientation}
              size={size}
              color={color}
              disabled={disabled}
              formatValue={formatValue}
            />
          ))}
        </SliderPrimitive.Root>

        {/* Mark labels (outside the slider) */}
        {marks?.some((m) => m.label) && (
          <div
            className={cn(
              "relative",
              orientation === "horizontal" ? "mt-3" : "ml-3"
            )}
          >
            {marks.map((mark, index) => {
              if (!mark.label) return null
              const position = getMarkPosition(mark.value)
              const style: React.CSSProperties = orientation === "horizontal"
                ? { left: `${position}%` }
                : { top: `${100 - position}%` }

              return (
                <span
                  key={index}
                  className={cn(sliderMarkLabelVariants({ orientation }))}
                  style={style}
                >
                  {mark.label}
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
Slider.displayName = "Slider"

// ============================================================================
// Exports
// ============================================================================

export {
  Slider,
  sliderVariants,
  sliderTrackVariants,
  sliderRangeVariants,
  sliderThumbVariants,
  sliderMarkVariants,
  sliderMarkLabelVariants,
  sliderTooltipVariants,
}
