"use client"

import { Label } from "@/components/ui/label"
import type { ObjectField as ObjectFieldConfig } from "../types"
import { AutoField } from "./auto-field"

interface ObjectFieldProps {
  config: ObjectFieldConfig
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}

export function ObjectField({ config, value = {}, onChange }: ObjectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
        {Object.entries(config.fields).map(([key, fieldConfig]) => (
          <AutoField
            key={key}
            config={fieldConfig}
            value={value[key]}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        ))}
      </div>
    </div>
  )
}
