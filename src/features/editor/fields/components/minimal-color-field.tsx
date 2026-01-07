"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ColorField as ColorFieldConfig } from "../types"

interface MinimalColorFieldProps {
  config: ColorFieldConfig
  value: string
  onChange: (value: string) => void
}

export function MinimalColorField({ config, value, onChange }: MinimalColorFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentValue = value || "#000000"

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-12 p-0 border-2"
              style={{ backgroundColor: currentValue }}
            >
              <span className="sr-only">Pick color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <Input
                type="color"
                value={currentValue}
                onChange={(e) => onChange(e.target.value)}
                className="h-12 w-full"
              />
              {config.presets && config.presets.length > 0 && (
                <div className="grid grid-cols-6 gap-2">
                  {config.presets.map((preset) => (
                    <button
                      key={preset}
                      className="h-8 w-8 rounded border-2 border-border hover:border-primary"
                      style={{ backgroundColor: preset }}
                      onClick={() => {
                        onChange(preset)
                        setIsOpen(false)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-8 text-xs font-mono flex-1"
        />
      </div>
    </div>
  )
}