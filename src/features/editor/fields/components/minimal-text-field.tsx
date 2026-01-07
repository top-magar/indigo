"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TextField as TextFieldConfig } from "../types"

interface MinimalTextFieldProps {
  config: TextFieldConfig
  value: string
  onChange: (value: string) => void
}

export function MinimalTextField({ config, value, onChange }: MinimalTextFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        maxLength={config.maxLength}
        minLength={config.minLength}
        className="h-8 text-xs"
      />
    </div>
  )
}