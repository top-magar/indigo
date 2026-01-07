"use client"

import { useFormStatus } from "react-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import type { VariantProps } from "class-variance-authority"

interface SubmitButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  pendingText?: string
  children: React.ReactNode
}

/**
 * Submit button that automatically shows loading state when form is pending
 * Uses React 19's useFormStatus hook for automatic pending detection
 * 
 * @see https://nextjs.org/docs/app/guides/forms#pending-states
 */
export function SubmitButton({ 
  children, 
  pendingText,
  className,
  disabled,
  variant,
  size,
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending || disabled}
      className={cn(className)}
      {...props}
    >
      {pending ? (
        <>
          <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
          {pendingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
