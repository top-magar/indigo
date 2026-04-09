"use client"

import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface HoverScaleProps extends HTMLMotionProps<"div"> {
  scale?: number
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ scale = 1.02, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
HoverScale.displayName = "HoverScale"
