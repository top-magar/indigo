"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/shared/utils"
import type { TextareaFieldProps } from "./types"

/**
 * Shared TextareaField component used by both Block Builder and Visual Editor.
 * Provides consistent multi-line text input styling and behavior.
 */
export function TextareaField({
  label,
  value,
  onChange,
  description,
  placeholder,
  disabled = false,
  required = false,
  rows = 3,
  maxLength,
  className,
}: TextareaFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className="resize-none"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
