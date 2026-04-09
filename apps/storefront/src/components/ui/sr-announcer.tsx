"use client";

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";

interface AnnouncerContextValue {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return a no-op if used outside provider
    return { announce: () => {} };
  }
  return context;
}

interface SRAnnouncerProviderProps {
  children: ReactNode;
}

export function SRAnnouncerProvider({ children }: SRAnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      // Small delay to ensure screen readers pick up the change
      requestAnimationFrame(() => setAssertiveMessage(message));
    } else {
      setPoliteMessage("");
      requestAnimationFrame(() => setPoliteMessage(message));
    }
  }, []);

  // Clear messages after they've been announced
  useEffect(() => {
    if (politeMessage) {
      const timer = setTimeout(() => setPoliteMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeMessage]);

  useEffect(() => {
    if (assertiveMessage) {
      const timer = setTimeout(() => setAssertiveMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveMessage]);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Visually hidden live regions for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}
