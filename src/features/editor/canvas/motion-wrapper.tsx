"use client";

import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import type { ElementAnimation } from "../core/types";

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  animations?: ElementAnimation;
  children: ReactNode;
  /** Pass true in the editor so it doesn't play animations constantly while dragging/editing unless in preview mode */
  disableAnimations?: boolean;
}

export const MotionWrapper = React.forwardRef<HTMLDivElement, MotionWrapperProps>(
  function MotionWrapper({ animations, children, disableAnimations, style, className, ...rest }, ref) {
    if (!animations || animations.preset === 'none' || disableAnimations) {
      // Render without motion if no animations are set or they are disabled
      return (
        <div ref={ref} style={style as any} className={className} {...(rest as any)}>
          {children}
        </div>
      );
    }

  const { preset, duration = 0.5, delay = 0, trigger = 'on-load' } = animations;

  const transition = {
    duration: duration,
    delay: delay,
    ease: "easeOut",
  } as any;

  let initial: any = {};
  let animate: any = {};
  let whileInView: any = {};
  let whileHover: any = {};

  switch (preset) {
    case 'fade':
      initial = { opacity: 0 };
      animate = { opacity: 1 };
      break;
    case 'slide-up':
      initial = { opacity: 0, y: 50 };
      animate = { opacity: 1, y: 0 };
      break;
    case 'slide-down':
      initial = { opacity: 0, y: -50 };
      animate = { opacity: 1, y: 0 };
      break;
    case 'zoom-in':
      initial = { opacity: 0, scale: 0.9 };
      animate = { opacity: 1, scale: 1 };
      break;
  }

  const motionProps: HTMLMotionProps<"div"> = {
    style: style as any,
    className,
    transition,
    ...rest
  };

  if (trigger === 'on-load') {
    motionProps.initial = initial;
    motionProps.animate = animate;
  } else if (trigger === 'on-scroll') {
    motionProps.initial = initial;
    motionProps.whileInView = animate;
    motionProps.viewport = { once: true, amount: 0.1 };
  } else if (trigger === 'hover') {
    motionProps.initial = animate; // Base state is the end state of the preset
    motionProps.whileHover = {
      ...animate,
      scale: preset === 'zoom-in' ? 1.05 : 1,
      y: preset === 'slide-up' ? -10 : (preset === 'slide-down' ? 10 : 0)
    };
  }

  return (
    <motion.div ref={ref} {...motionProps}>
      {children}
    </motion.div>
  );
});
