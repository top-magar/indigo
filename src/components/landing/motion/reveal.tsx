"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * Scroll reveal wrapper — fades and rises content when it enters the viewport.
 * Respects prefers-reduced-motion (falls back to opacity-only).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={rise}
      transition={{ delay }}
      data-reveal
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container — children with the `item` variant animate in sequence.
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * Count-up hook — animates a numeric string (e.g. "10M+", "85%", "3×") from 0
 * to its value when the element enters the viewport. Reduced motion jumps.
 */
export function useCountUp(target: string, duration = 1400) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = useMemo(() => target.match(/^([\d.]+)(.*)$/), [target]);
  const [display, setDisplay] = useState(() => (match ? "0" : target));

  useEffect(() => {
    if (!inView || !match) return;
    const end = parseFloat(match[1]);
    const suffix = match[2];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduced) {
      raf = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = (end * eased).toFixed(end % 1 === 0 ? 0 : 1);
      setDisplay(`${value}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, match]);

  return { ref, display };
}

export { EASE };
