"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/shared/utils"
import type { SelectFieldProps } from "./types"

/**
 * Shared SelectField component used by both Block Builder and Visual Editor.
 * Provides consistent dropdown select styling and behavior.
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  description,
  placeholder = "Select...",
  disabled = false,
  required = false,
  className,
}: SelectFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        size="sm"
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
