"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { BooleanField as BooleanFieldConfig } from "../types"

interface BooleanFieldProps {
  config: BooleanFieldConfig
  value: boolean
  onChange: (value: boolean) => void
}

export function BooleanField({ config, value, onChange }: BooleanFieldProps) {
  const currentValue = value ?? (config.defaultValue as boolean) ?? false

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{config.label}</Label>
        {config.description && (
          <p className="text-xs text-muted-foreground">{config.description}</p>
        )}
      </div>
      <Switch checked={currentValue} onCheckedChange={onChange} />
    </div>
  )
}
