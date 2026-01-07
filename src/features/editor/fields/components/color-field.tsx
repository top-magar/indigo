"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/shared/utils"
import type { ColorField as ColorFieldConfig } from "../types"

interface ColorFieldProps {
  config: ColorFieldConfig
  value: string
  onChange: (value: string) => void
}

const DEFAULT_PRESETS = [
  "#000000", "#ffffff", "#f8f9fa", "#1a1a2e",
  "#e63946", "#2a9d8f", "#f4a261", "#264653",
]

export function ColorField({ config, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false)
  const presets = config.presets || DEFAULT_PRESETS

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-9 w-9 p-0 border-2"
              style={{ backgroundColor: value || "#ffffff" }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    className={cn(
                      "h-8 w-8 rounded-md border-2 transition-all",
                      value === preset ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    )}
                    style={{ backgroundColor: preset }}
                    onClick={() => {
                      onChange(preset)
                      setOpen(false)
                    }}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={value || "#ffffff"}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-full cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
