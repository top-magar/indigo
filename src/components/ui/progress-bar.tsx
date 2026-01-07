"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils";

interface ProgressBarProps {
  className?: string;
}

export function ProgressBar({ className }: ProgressBarProps) {
  return (
    <motion.div
      className={cn(
        "fixed inset-x-0 top-0 z-[100] h-1 bg-primary",
        className
      )}
      initial={{ scaleX: 0, transformOrigin: "left" }}
      animate={{
        scaleX: [0, 0.4, 0.6, 0.8, 0.9],
        transition: {
          duration: 2,
          ease: "easeOut",
        },
      }}
      exit={{
        scaleX: 1,
        opacity: 0,
        transition: {
          duration: 0.2,
          ease: "easeIn",
        },
      }}
    />
  );
}

// Hook to manage progress bar state
export function useProgressBar() {
  const [isLoading, setIsLoading] = React.useState(false);

  const start = React.useCallback(() => setIsLoading(true), []);
  const done = React.useCallback(() => setIsLoading(false), []);

  return { isLoading, start, done };
}

// Provider component for app-wide progress bar
interface ProgressBarProviderProps {
  children: React.ReactNode;
}

const ProgressBarContext = React.createContext<{
  isLoading: boolean;
  start: () => void;
  done: () => void;
} | null>(null);

export function ProgressBarProvider({ children }: ProgressBarProviderProps) {
  const progressBar = useProgressBar();

  return (
    <ProgressBarContext.Provider value={progressBar}>
      <AnimatePresence>
        {progressBar.isLoading && <ProgressBar />}
      </AnimatePresence>
      {children}
    </ProgressBarContext.Provider>
  );
}

export function useProgressBarContext() {
  const context = React.useContext(ProgressBarContext);
  if (!context) {
    throw new Error("useProgressBarContext must be used within ProgressBarProvider");
  }
  return context;
}
