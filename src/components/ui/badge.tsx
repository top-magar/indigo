import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/utils"

const badgeVariants = cva(
  "gap-1 border border-transparent font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        // shadcn/ui variants
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Geist solid variants
        "geist-gray": "bg-[var(--ds-gray-200)] text-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-800)] dark:text-[var(--ds-gray-100)]",
        "geist-blue": "bg-[var(--ds-blue-700)] text-white",
        "geist-purple": "bg-[var(--ds-purple-700)] text-white",
        "geist-amber": "bg-[var(--ds-amber-700)] text-white",
        "geist-red": "bg-[var(--ds-red-700)] text-white",
        "geist-pink": "bg-[var(--ds-pink-700)] text-white",
        "geist-green": "bg-[var(--ds-green-700)] text-white",
        "geist-teal": "bg-[var(--ds-teal-700)] text-white",
        // Geist subtle variants
        "geist-gray-subtle": "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] dark:bg-[var(--ds-gray-900)] dark:text-[var(--ds-gray-100)]",
        "geist-blue-subtle": "bg-[var(--ds-blue-100)] text-[var(--ds-blue-900)] dark:bg-[var(--ds-blue-900)] dark:text-[var(--ds-blue-100)]",
        "geist-purple-subtle": "bg-[var(--ds-purple-100)] text-[var(--ds-purple-900)] dark:bg-[var(--ds-purple-900)] dark:text-[var(--ds-purple-100)]",
        "geist-amber-subtle": "bg-[var(--ds-amber-100)] text-[var(--ds-amber-900)] dark:bg-[var(--ds-amber-900)] dark:text-[var(--ds-amber-100)]",
        "geist-red-subtle": "bg-[var(--ds-red-100)] text-[var(--ds-red-900)] dark:bg-[var(--ds-red-900)] dark:text-[var(--ds-red-100)]",
        "geist-pink-subtle": "bg-[var(--ds-pink-100)] text-[var(--ds-pink-900)] dark:bg-[var(--ds-pink-900)] dark:text-[var(--ds-pink-100)]",
        "geist-green-subtle": "bg-[var(--ds-green-100)] text-[var(--ds-green-900)] dark:bg-[var(--ds-green-900)] dark:text-[var(--ds-green-100)]",
        "geist-teal-subtle": "bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)] dark:bg-[var(--ds-teal-900)] dark:text-[var(--ds-teal-100)]",
      },
      size: {
        sm: "h-5 px-1.5 text-xs [&>svg]:size-2.5",      // compact badges (default)
        default: "h-6 px-2 text-xs [&>svg]:size-3",     // standard
        lg: "h-7 px-2.5 text-sm [&>svg]:size-3.5",      // larger badges
      },
      radius: {
        default: "rounded-sm", // 4px - compact badges
        sm: "rounded-sm",      // 4px
        md: "rounded-lg",      // 8px
        full: "rounded-full",  // 9999px - pill shape for status badges
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      radius: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "sm",
  radius = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size, radius }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
