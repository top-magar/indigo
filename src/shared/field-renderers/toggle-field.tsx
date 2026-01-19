"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/shared/utils"
import type { ToggleFieldProps } from "./types"

/**
 * Shared ToggleField component used by the Visual Editor.
 * Provides consistent boolean toggle styling and behavior.
 */
export function ToggleField({
  label,
  value,
  onChange,
  description,
  disabled = false,
  className,
}: ToggleFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={id} className="text-xs font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={value ?? false}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}
