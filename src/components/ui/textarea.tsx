import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const textareaVariants = cva(
  "resize-none rounded-md border transition-colors placeholder:text-[var(--ds-gray-500)] flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] focus:border-[var(--ds-gray-900)] focus:ring-0",
        "geist-default":
          "bg-[var(--ds-background-100)] border-[var(--ds-gray-300)] focus:border-[var(--ds-gray-900)] focus:outline-none",
      },
      size: {
        sm: "py-1.5 px-2.5 text-sm",
        default: "py-2 px-3 text-sm",
        lg: "py-3 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant = "default", size = "sm", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      data-size={size}
      className={cn(textareaVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
