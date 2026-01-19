"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const checkboxVariants = cva(
  "border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] data-checked:bg-[var(--ds-gray-1000)] data-checked:text-[var(--ds-background-100)] data-checked:border-[var(--ds-gray-1000)] aria-invalid:aria-checked:border-[var(--ds-gray-1000)] aria-invalid:border-[var(--ds-red-700)] focus-visible:border-[var(--ds-gray-900)] focus-visible:ring-[var(--ds-gray-900)]/10 aria-invalid:ring-[var(--ds-red-700)]/20 flex items-center justify-center rounded-[4px] border transition-shadow group-has-disabled/field:opacity-50 focus-visible:ring-[2px] aria-invalid:ring-[2px] peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

const checkboxIndicatorVariants = cva(
  "grid place-content-center text-current transition-none",
  {
    variants: {
      size: {
        sm: "[&>svg]:size-3",
        default: "[&>svg]:size-3.5",
        lg: "[&>svg]:size-4",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({
  className,
  size,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ size, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(checkboxIndicatorVariants({ size }))}
      >
        <Check strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants, checkboxIndicatorVariants }
