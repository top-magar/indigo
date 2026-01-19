"use client"

import { motion } from "framer-motion"
import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCheckboxProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
}

export const AnimatedCheckbox = forwardRef<HTMLButtonElement, AnimatedCheckboxProps>(
  ({ checked = false, onChange, label, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={cn("flex items-center gap-2 group", className)}
      {...props}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center",
          "h-4 w-4 rounded-sm border",
          "transition-colors duration-150",
          checked
            ? "bg-[var(--ds-gray-1000)] border-[var(--ds-gray-1000)]"
            : "bg-white border-[var(--ds-gray-400)] group-hover:border-[var(--ds-gray-600)]"
        )}
        animate={{ scale: checked ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M2 5l2 2 4-4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>
      {label && (
        <span className="text-sm text-[var(--ds-gray-800)]">{label}</span>
      )}
    </button>
  )
)
AnimatedCheckbox.displayName = "AnimatedCheckbox"
