"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface TapBounceProps extends HTMLMotionProps<"div"> {
  bounceScale?: number
}

export const TapBounce = forwardRef<HTMLDivElement, TapBounceProps>(
  ({ bounceScale = 0.95, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileTap={{ scale: bounceScale }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
TapBounce.displayName = "TapBounce"
