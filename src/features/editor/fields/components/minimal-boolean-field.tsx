"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { BooleanField as BooleanFieldConfig } from "../types"

interface MinimalBooleanFieldProps {
  config: BooleanFieldConfig
  value: boolean
  onChange: (value: boolean) => void
}

export function MinimalBooleanField({ config, value, onChange }: MinimalBooleanFieldProps) {
  const currentValue = value ?? (config.defaultValue as boolean) ?? false

  return (
    <div className="flex items-center justify-between py-1">
      <Label className="text-xs font-medium">{config.label}</Label>
      <Switch checked={currentValue} onCheckedChange={onChange} />
    </div>
  )
}