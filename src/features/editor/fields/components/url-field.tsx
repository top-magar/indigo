"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "lucide-react"
import type { UrlField as UrlFieldConfig } from "../types"

interface UrlFieldProps {
  config: UrlFieldConfig
  value: string
  onChange: (value: string) => void
}

export function UrlField({ config, value, onChange }: UrlFieldProps) {
  const placeholder = config.allowInternal
    ? "/products or https://..."
    : "https://..."

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <div className="relative">
        <Link
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder || placeholder}
          className="pl-9"
        />
      </div>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
