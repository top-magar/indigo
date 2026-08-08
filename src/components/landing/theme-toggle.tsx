"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Landing-page theme toggle. Now uses the global next-themes provider
 * to ensure consistent theme architecture across the entire app.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid an icon flash while the client reads the theme.
  if (!mounted) {
    return <span className="lv2-theme-toggle lv2-theme-toggle--placeholder" aria-hidden />;
  }

  const activeTheme = resolvedTheme || theme;

  const toggle = () => {
    setTheme(activeTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className="lv2-theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${activeTheme === "dark" ? "light" : "dark"} theme`}
      aria-pressed={activeTheme === "light"}
    >
      {activeTheme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </button>
  );
}
