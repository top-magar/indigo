"use client"

import { motion } from "framer-motion"
import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedToggleProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: { track: "w-8 h-4", thumb: "h-3 w-3", translate: 16 },
  md: { track: "w-11 h-6", thumb: "h-5 w-5", translate: 20 },
  lg: { track: "w-14 h-7", thumb: "h-6 w-6", translate: 28 },
}

export const AnimatedToggle = forwardRef<HTMLButtonElement, AnimatedToggleProps>(
  ({ checked = false, onChange, size = "md", className, ...props }, ref) => {
    const s = sizes[size]

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full",
          "transition-colors duration-150",
          s.track,
          checked ? "bg-[var(--ds-gray-1000)]" : "bg-[var(--ds-gray-300)]",
          className
        )}
        {...props}
      >
        <motion.span
          className={cn(
            "pointer-events-none rounded-full bg-white shadow-sm",
            "absolute top-0.5 left-0.5",
            s.thumb
          )}
          animate={{ x: checked ? s.translate : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    )
  }
)
AnimatedToggle.displayName = "AnimatedToggle"
