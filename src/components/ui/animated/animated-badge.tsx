"use client"

import { motion, AnimatePresence } from "framer-motion"
import { forwardRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedBadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info"
  pulse?: boolean
  className?: string
  children?: ReactNode
}

const variantStyles = {
  default: "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]",
  success: "bg-[var(--ds-green-100)] text-[var(--ds-green-800)]",
  warning: "bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)]",
  error: "bg-[var(--ds-red-100)] text-[var(--ds-red-800)]",
  info: "bg-[var(--ds-blue-100)] text-[var(--ds-blue-800)]",
}

export const AnimatedBadge = forwardRef<HTMLSpanElement, AnimatedBadgeProps>(
  ({ variant = "default", pulse = false, className, children, ...props }, ref) => (
    <motion.span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1",
        "h-5 px-2 rounded-sm text-xs font-medium",
        variantStyles[variant],
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </motion.span>
  )
)
AnimatedBadge.displayName = "AnimatedBadge"

interface NotificationDotProps {
  count?: number
  max?: number
  className?: string
}

export function NotificationDot({ count = 0, max = 99, className }: NotificationDotProps) {
  const displayCount = count > max ? `${max}+` : count

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          className={cn(
            "absolute -right-1 -top-1 flex items-center justify-center",
            "min-w-[18px] h-[18px] px-1 rounded-full",
            "bg-[var(--ds-red-600)] text-white text-[10px] font-medium",
            className
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {displayCount}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
