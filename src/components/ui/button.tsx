import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/utils"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 border border-transparent bg-clip-padding text-xs/relaxed font-medium focus-visible:ring-[2px] aria-invalid:ring-[2px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        // shadcn/ui variants
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border dark:bg-input/30 hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
        // Geist variants
        "geist-primary": "bg-[var(--ds-gray-1000)] text-white hover:bg-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-100)] dark:text-[var(--ds-gray-1000)] dark:hover:bg-[var(--ds-gray-200)]",
        "geist-secondary": "bg-[var(--ds-background-100)] border-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-900)] dark:border-[var(--ds-gray-700)] dark:hover:bg-[var(--ds-gray-800)]",
        "geist-tertiary": "bg-transparent hover:bg-[var(--ds-gray-100)] dark:hover:bg-[var(--ds-gray-800)]",
        "geist-error": "bg-[var(--ds-red-700)] text-white hover:bg-[var(--ds-red-800)]",
        "geist-warning": "bg-[var(--ds-amber-700)] text-white hover:bg-[var(--ds-amber-800)]",
        "geist-success": "bg-[var(--ds-green-700)] text-white hover:bg-[var(--ds-green-800)]",
      },
      size: {
        default: "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
      radius: {
        default: "rounded-md",  // 6px - Vercel default for interactive elements
        sm: "rounded-sm",       // 4px
        md: "rounded-md",       // 6px
        lg: "rounded-lg",       // 8px
        xl: "rounded-xl",       // 12px
        full: "rounded-full",   // 9999px - pill shape
        none: "rounded-none",   // 0px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  radius = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-radius={radius}
      className={cn(buttonVariants({ variant, size, radius, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
