"use client";

import { motion } from "motion/react";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="motion-reduce:!opacity-100 motion-reduce:!transform-none"
    >
      {children}
    </motion.div>
  );
}
