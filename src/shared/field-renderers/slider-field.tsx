"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/shared/utils"
import type { SliderFieldProps } from "./types"

/**
 * Shared SliderField component used by both Block Builder and Visual Editor.
 * Provides consistent range slider styling and behavior.
 */
export function SliderField({
  label,
  value,
  onChange,
  description,
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  showValue = true,
  className,
}: SliderFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {showValue && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {value ?? min}
            {suffix}
          </span>
        )}
      </div>
      <Slider
        id={id}
        value={[value ?? min]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
