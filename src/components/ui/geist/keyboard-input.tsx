"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils"

const keyboardInputVariants = cva(
  "inline-flex items-center gap-1",
  {
    variants: {
      size: {
        sm: "gap-0.5",
        md: "gap-1",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const keyVariants = cva(
  "inline-flex items-center justify-center rounded-sm border border-border bg-muted font-sans font-medium text-muted-foreground select-none",
  {
    variants: {
      size: {
        sm: "min-w-5 h-5 px-1 text-[10px]",
        md: "min-w-6 h-6 px-1.5 text-xs",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// Common key symbol mappings
const keySymbols: Record<string, string> = {
  cmd: "⌘",
  command: "⌘",
  ctrl: "⌃",
  control: "⌃",
  alt: "⌥",
  option: "⌥",
  shift: "⇧",
  enter: "↵",
  return: "↵",
  backspace: "⌫",
  delete: "⌦",
  escape: "⎋",
  esc: "⎋",
  tab: "⇥",
  space: "␣",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

export interface KeyboardInputProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof keyboardInputVariants> {
  /** Array of keys to display */
  keys: string[]
}

const KeyboardInput = React.forwardRef<HTMLElement, KeyboardInputProps>(
  ({ className, keys, size = "md", ...props }, ref) => {
    const formatKey = (key: string): string => {
      const lowerKey = key.toLowerCase()
      return keySymbols[lowerKey] || key.toUpperCase()
    }

    // Create accessible label
    const accessibleLabel = keys.join(" + ")

    return (
      <kbd
        ref={ref}
        className={cn(keyboardInputVariants({ size }), className)}
        aria-label={`Keyboard shortcut: ${accessibleLabel}`}
        {...props}
      >
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <span className={cn(keyVariants({ size }))} aria-hidden="true">
              {formatKey(key)}
            </span>
            {index < keys.length - 1 && (
              <span
                className={cn(
                  "text-muted-foreground",
                  size === "sm" ? "text-[10px]" : "text-xs"
                )}
                aria-hidden="true"
              >
                +
              </span>
            )}
          </React.Fragment>
        ))}
      </kbd>
    )
  }
)
KeyboardInput.displayName = "KeyboardInput"

export { KeyboardInput, keyboardInputVariants }
