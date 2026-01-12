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
  const updateField = (key: string, fieldValue: unknown) => {
    onChange({ ...value, [key]: fieldValue })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">{config.label}</Label>
        {config.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
        )}
      </div>
      
      <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
        {Object.entries(config.fields).map(([key, fieldConfig]) => (
          <AutoField
            key={key}
            config={fieldConfig}
            value={value[key]}
            onChange={(v) => updateField(key, v)}
          />
        ))}
      </div>
    </div>
  )
}
