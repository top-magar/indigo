"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/shared/utils"
import type { TextFieldProps } from "./types"

/**
 * Shared TextField component used by the Visual Editor.
 * Provides consistent text input styling and behavior across editors.
 */
export function TextField({
  label,
  value,
  onChange,
  description,
  placeholder,
  disabled = false,
  required = false,
  maxLength,
  minLength,
  className,
}: TextFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        size="sm"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
