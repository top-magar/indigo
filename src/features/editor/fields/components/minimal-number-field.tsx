"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NumberField as NumberFieldConfig } from "../types"

interface MinimalNumberFieldProps {
  config: NumberFieldConfig
  value: number
  onChange: (value: number) => void
}

export function MinimalNumberField({ config, value, onChange }: MinimalNumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    onChange(isNaN(val) ? 0 : val)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value || ""}
          onChange={handleChange}
          placeholder={config.placeholder}
          min={config.min}
          max={config.max}
          step={config.step}
          className="h-8 text-xs"
        />
        {config.suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {config.suffix}
          </span>
        )}
      </div>
    </div>
  )
}