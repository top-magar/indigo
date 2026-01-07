"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { TextareaField as TextareaFieldConfig } from "../types"

interface MinimalTextareaFieldProps {
  config: TextareaFieldConfig
  value: string
  onChange: (value: string) => void
}

export function MinimalTextareaField({ config, value, onChange }: MinimalTextareaFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        rows={config.rows || 3}
        maxLength={config.maxLength}
        className="text-xs resize-none"
      />
    </div>
  )
}