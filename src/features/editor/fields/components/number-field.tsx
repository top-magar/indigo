"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { NumberField as NumberFieldConfig } from "../types"

interface NumberFieldProps {
  config: NumberFieldConfig
  value: number
  onChange: (value: number) => void
}

export function NumberField({ config, value, onChange }: NumberFieldProps) {
  const hasRange = config.min !== undefined && config.max !== undefined
  const currentValue = value ?? config.defaultValue ?? config.min ?? 0

  if (hasRange) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">{config.label}</Label>
          <span className="text-sm text-muted-foreground">
            {currentValue}{config.suffix || ""}
          </span>
        </div>
        <Slider
          value={[currentValue]}
          onValueChange={([v]) => onChange(v)}
          min={config.min}
          max={config.max}
          step={config.step || 1}
          className="py-2"
        />
        {config.description && (
          <p className="text-xs text-muted-foreground">{config.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          min={config.min}
          max={config.max}
          step={config.step}
          className="flex-1"
        />
        {config.suffix && (
          <span className="text-sm text-muted-foreground">{config.suffix}</span>
        )}
      </div>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
