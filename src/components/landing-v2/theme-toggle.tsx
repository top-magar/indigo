"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "lv2-theme";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * Landing-page theme toggle. The landing renders light by default straight from
 * CSS (`html:not([data-theme="dark"]) .lv2-page`), so no attribute is present
 * until the visitor opts into dark, at which point this sets
 * <html data-theme="dark">. Independent of the app's next-themes provider
 * (the landing ships its own token set).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Re-apply a previously chosen dark theme. The landing is light by default
    // in CSS, so only "dark" needs restoring. This runs after paint, so a
    // returning dark-mode visitor sees a brief light flash; eliminating it
    // needs a real blocking <script> in the root layout <head>, which is
    // tracked separately.
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* Private mode — fall through to the CSS default. */
    }
    if (stored === "dark") {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
    setTheme(readTheme());
  }, []);

  // Avoid an icon flash while the client reads the boot-set attribute.
  if (theme === null) {
    return <span className="lv2-theme-toggle lv2-theme-toggle--placeholder" aria-hidden />;
  }

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Private mode — theme still applies for this session. */
    }
  };

  return (
    <button
      type="button"
      className="lv2-theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={theme === "light"}
    >
      {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </button>
  );
}
