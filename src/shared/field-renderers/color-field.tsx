"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/shared/utils"
import type { ColorFieldProps } from "./types"
import { DEFAULT_COLOR_PRESETS } from "./types"

/**
 * Shared ColorField component used by the Visual Editor.
 * Provides consistent color picker with presets and hex input.
 */
export function ColorField({
  label,
  value,
  onChange,
  description,
  disabled = false,
  required = false,
  presets = DEFAULT_COLOR_PRESETS,
  showInput = true,
  className,
}: ColorFieldProps) {
  const id = React.useId()
  const colorInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0 border-2"
              disabled={disabled}
              style={{ backgroundColor: value || "#ffffff" }}
            >
              <span className="sr-only">Pick a color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              {/* Native color picker */}
              <div className="flex items-center gap-2">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={value || "#ffffff"}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                />
                <span className="text-xs text-muted-foreground">
                  Click to pick custom color
                </span>
              </div>
              
              {/* Preset colors */}
              {presets.length > 0 && (
                <div className="grid grid-cols-5 gap-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded border-2 transition-all hover:scale-110",
                        value === preset
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: preset }}
                      onClick={() => onChange(preset)}
                      disabled={disabled}
                    >
                      <span className="sr-only">{preset}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {showInput && (
          <Input
            id={id}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            disabled={disabled}
            size="sm"
            className="flex-1 font-mono text-xs"
            maxLength={7}
          />
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
