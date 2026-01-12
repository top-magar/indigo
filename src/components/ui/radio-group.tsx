"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"
import { Circle } from "lucide-react"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3 w-full", className)}
      {...props}
    />
  )
}

const radioGroupItemVariants = cva(
  "border-input text-primary dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 data-checked:bg-primary data-checked:border-primary flex rounded-full transition-none focus-visible:ring-[2px] aria-invalid:ring-[2px] group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "size-4", // 16px - dense UIs, default
        default: "size-5", // 20px - standard
        lg: "size-6", // 24px - larger forms
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const radioGroupIndicatorVariants = cva(
  "group-aria-invalid/radio-group-item:text-destructive flex items-center justify-center text-white",
  {
    variants: {
      size: {
        sm: "size-4", // 16px
        default: "size-5", // 20px
        lg: "size-6", // 24px
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const radioGroupDotVariants = cva(
  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-current",
  {
    variants: {
      size: {
        sm: "size-2", // 8px dot for 16px container
        default: "size-2.5", // 10px dot for 20px container
        lg: "size-3", // 12px dot for 24px container
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

function RadioGroupItem({
  className,
  size,
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={radioGroupIndicatorVariants({ size })}
      >
        <Circle strokeWidth={2} className={radioGroupDotVariants({ size })} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants, radioGroupIndicatorVariants, radioGroupDotVariants }
