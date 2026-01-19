"use client"

import { motion, AnimatePresence } from "framer-motion"
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"
import { Check, AlertCircle } from "lucide-react"

interface AnimatedInputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string
  error?: string
  success?: boolean
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, success, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="space-y-1.5">
        {label && (
          <motion.label
            className="block text-sm font-medium text-[var(--ds-gray-700)]"
            animate={{ color: isFocused ? "var(--ds-gray-900)" : "var(--ds-gray-700)" }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "h-10 w-full px-3 rounded-md text-sm",
              "border bg-white",
              "placeholder:text-[var(--ds-gray-500)]",
              "focus:outline-none focus:ring-0",
              "transition-colors duration-150",
              error
                ? "border-[var(--ds-red-500)]"
                : success
                  ? "border-[var(--ds-green-500)]"
                  : "border-[var(--ds-gray-300)] focus:border-[var(--ds-gray-900)]",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {error ? (
                  <AlertCircle className="h-4 w-4 text-[var(--ds-red-500)]" />
                ) : (
                  <Check className="h-4 w-4 text-[var(--ds-green-500)]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-xs text-[var(--ds-red-600)]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
AnimatedInput.displayName = "AnimatedInput"
