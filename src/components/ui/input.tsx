import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Search } from "lucide-react"

import { cn } from "@/shared/utils"

const inputVariants = cva(
  "border transition-colors file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-[2px] aria-invalid:ring-[2px]",
        "geist-default":
          "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] focus:border-[var(--ds-blue-700)] dark:bg-[var(--ds-gray-900)] dark:border-[var(--ds-gray-700)] focus:outline-none",
        "geist-search":
          "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] focus:border-[var(--ds-blue-700)] dark:bg-[var(--ds-gray-900)] dark:border-[var(--ds-gray-700)] focus:outline-none pl-9",
      },
      size: {
        sm: "h-8 px-2.5 py-1.5 text-base sm:text-sm file:h-6",      // 32px - dense UIs (≥16px on mobile)
        default: "h-10 px-3 py-2 text-base sm:text-sm file:h-7",    // 40px - standard (≥16px on mobile)
        lg: "h-12 px-4 py-3 text-base file:h-8",                     // 48px - primary CTAs
      },
      radius: {
        default: "rounded-md", // 6px - Vercel default for interactive elements
        sm: "rounded-sm",      // 4px
        md: "rounded-md",      // 6px
        lg: "rounded-lg",      // 8px
        xl: "rounded-xl",      // 12px
        none: "rounded-none",  // 0px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      radius: "default",
    },
  }
)

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({
  className,
  type,
  variant = "default",
  size = "sm",
  radius = "default",
  ...props
}: InputProps) {
  if (variant === "geist-search") {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ds-gray-900)] dark:text-[var(--ds-gray-400)]" />
        <input
          type={type}
          data-slot="input"
          data-variant={variant}
          data-size={size}
          data-radius={radius}
          className={cn(inputVariants({ variant, size, radius, className }))}
          {...props}
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      className={cn(inputVariants({ variant, size, radius, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
