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

interface MinimalSelectFieldProps {
  config: SelectFieldConfig
  value: string
  onChange: (value: string) => void
}

export function MinimalSelectField({ config, value, onChange }: MinimalSelectFieldProps) {
  const currentValue = value || (config.defaultValue as string) || ""

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <Select value={currentValue} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={config.placeholder || "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {config.options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}