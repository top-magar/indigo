"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { TextareaField as TextareaFieldConfig } from "../types"

interface TextareaFieldProps {
  config: TextareaFieldConfig
  value: string
  onChange: (value: string) => void
}

export function TextareaField({ config, value, onChange }: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        rows={config.rows || 3}
        maxLength={config.maxLength}
      />
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
