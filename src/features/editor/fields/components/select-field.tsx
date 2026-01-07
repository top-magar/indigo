"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SelectField as SelectFieldConfig } from "../types"

interface SelectFieldProps {
  config: SelectFieldConfig
  value: string
  onChange: (value: string) => void
}

export function SelectField({ config, value, onChange }: SelectFieldProps) {
  const currentValue = value || (config.defaultValue as string) || ""

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <Select value={currentValue} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={config.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
