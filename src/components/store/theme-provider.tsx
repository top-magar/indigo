import React from "react"
import { type ThemeConfig, defaultThemeConfig, generateThemeCssVars } from "@/features/editor/lib/theme-utils"
import { cn } from "@/shared/utils"

export function ThemeProvider({ 
  theme, 
  children,
  className
}: { 
  theme: Partial<ThemeConfig> | null; 
  children: React.ReactNode;
  className?: string;
}) {
  const mergedTheme = { ...defaultThemeConfig, ...theme } as ThemeConfig;
  const cssVars = generateThemeCssVars(mergedTheme);

  return (
    <div 
      className={cn("theme-provider-wrapper", className)} 
      style={{
        ...cssVars,
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        minHeight: "100%",
        width: "100%"
      } as React.CSSProperties}
    >
      {/* We can scope heading fonts by targeting heading tags within this wrapper in global CSS or using inline styles if preferred. 
          For now, standard CSS variables will be picked up by the UI elements. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .theme-provider-wrapper h1, 
        .theme-provider-wrapper h2, 
        .theme-provider-wrapper h3, 
        .theme-provider-wrapper h4, 
        .theme-provider-wrapper h5, 
        .theme-provider-wrapper h6 {
          font-family: var(--font-heading);
        }
      `}} suppressHydrationWarning />
      {children}
    </div>
  )
}
