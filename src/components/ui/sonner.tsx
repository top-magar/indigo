"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Accessibility: Ensure screen readers announce toast notifications
      // role="status" and aria-live="polite" are applied to the toast container
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
        // Note: Accessibility role is handled by sonner's containerAriaLabel prop
        // The toast container uses aria-live="polite" for screen reader announcements
      }}
      // Configure the container with aria-live for screen reader announcements
      containerAriaLabel="Notifications"
      icons={{
        success: (
          <CheckCircle strokeWidth={2} className="size-4" />
        ),
        info: (
          <Info strokeWidth={2} className="size-4" />
        ),
        warning: (
          <AlertTriangle strokeWidth={2} className="size-4" />
        ),
        error: (
          <XCircle strokeWidth={2} className="size-4" />
        ),
        loading: (
          <Loader2 strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
