"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "lv2-theme";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Landing-page theme toggle. The `data-theme` attribute lives on <html> and is
 * set pre-paint by the boot script in src/app/page.tsx, so this component only
 * needs to flip it and persist the choice. Independent of the app's
 * next-themes provider (the landing ships its own token set).
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
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
