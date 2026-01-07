"use client"

import { cn } from "@/shared/utils"

/**
 * AnimatedDropIndicator - Enhanced drop indicator with glow effect and smooth animation
 * 
 * Requirements: 2.1, 2.2
 * - WHEN a block drag starts, THE InlinePreview SHALL display an animated insertion indicator
 * - WHEN dragging over a valid drop zone, THE InlinePreview SHALL show a glowing insertion line
 */
export interface AnimatedDropIndicatorProps {
  /** Position of the indicator relative to the target block */
  position: "above" | "below"
  /** Whether to show the animated glow effect */
  animated?: boolean
  /** Additional CSS classes */
  className?: string
}

export function AnimatedDropIndicator({
  position,
  animated = true,
  className,
}: AnimatedDropIndicatorProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 flex items-center gap-2 pointer-events-none",
        position === "above" ? "-top-2" : "-bottom-2",
        animated && "animate-in fade-in duration-150",
        position === "above" && animated && "slide-in-from-top-1",
        position === "below" && animated && "slide-in-from-bottom-1",
        className
      )}
      data-testid="animated-drop-indicator"
      data-position={position}
    >
      {/* Left endpoint with glow */}
      <div
        className={cn(
          "h-3 w-3 rounded-full bg-primary flex items-center justify-center shrink-0",
          animated && "shadow-lg shadow-primary/40 animate-pulse"
        )}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      {/* Connecting line with glow effect */}
      <div className="relative flex-1 h-0.5">
        {/* Glow layer */}
        {animated && (
          <div className="absolute inset-0 bg-primary/50 rounded-full blur-sm" />
        )}
        {/* Main line */}
        <div
          className={cn(
            "absolute inset-0 bg-primary rounded-full",
            animated && "shadow-sm shadow-primary/30"
          )}
        />
      </div>

      {/* Right endpoint with glow */}
      <div
        className={cn(
          "h-3 w-3 rounded-full bg-primary flex items-center justify-center shrink-0",
          animated && "shadow-lg shadow-primary/40 animate-pulse"
        )}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  )
}

export default AnimatedDropIndicator
