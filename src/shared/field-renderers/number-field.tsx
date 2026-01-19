"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/shared/utils"
import type { NumberFieldProps } from "./types"

/**
 * Shared NumberField component used by the Visual Editor.
 * Provides consistent number input with optional min/max/step constraints.
 */
export function NumberField({
  label,
  value,
  onChange,
  description,
  placeholder,
  disabled = false,
  required = false,
  min,
  max,
  step = 1,
  suffix,
  className,
}: NumberFieldProps) {
  const id = React.useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") {
      onChange(undefined)
    } else {
      const num = parseFloat(val)
      if (!isNaN(num)) {
        onChange(num)
      }
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          size="sm"
          className="flex-1"
        />
        {suffix && (
          <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
