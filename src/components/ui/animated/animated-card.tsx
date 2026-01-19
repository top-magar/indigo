"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  variant?: "lift" | "scale" | "glow" | "border" | "tilt"
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ variant = "lift", className, children, ...props }, ref) => {
    const cardVariants = {
      lift: { whileHover: { y: -4 } },
      scale: { whileHover: { scale: 1.02 } },
      glow: { whileHover: {} },
      border: { whileHover: {} },
      tilt: { whileHover: { rotateX: 2, rotateY: 2, scale: 1.01 } },
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border border-[var(--ds-gray-200)] bg-white p-4",
          "transition-shadow duration-150",
          variant === "lift" && "hover:shadow-lg",
          variant === "glow" && "hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]",
          variant === "border" && "hover:border-[var(--ds-gray-400)]",
          className
        )}
        whileHover={cardVariants[variant].whileHover}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"
