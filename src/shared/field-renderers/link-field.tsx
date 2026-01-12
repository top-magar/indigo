"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Link, Link2 } from "lucide-react"
import { cn } from "@/shared/utils"
import type { LinkFieldProps } from "./types"

/**
 * Shared LinkField component used by both Block Builder and Visual Editor.
 * Provides consistent URL input with validation and preview.
 */
export function LinkField({
  label,
  value,
  onChange,
  description,
  placeholder = "https://example.com",
  disabled = false,
  required = false,
  allowInternal = true,
  className,
}: LinkFieldProps) {
  const id = React.useId()
  const [isValid, setIsValid] = React.useState(true)

  const validateUrl = (url: string): boolean => {
    if (!url) return true
    
    // Allow internal links starting with /
    if (allowInternal && url.startsWith("/")) return true
    
    // Allow anchor links
    if (url.startsWith("#")) return true
    
    // Validate external URLs
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsValid(validateUrl(newValue))
  }

  const handleOpenLink = () => {
    if (value && isValid) {
      const url = value.startsWith("/") ? value : value
      window.open(url, "_blank")
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="text"
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            size="sm"
            className={cn(
              "pl-9",
              !isValid && value && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
        {value && isValid && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleOpenLink}
            disabled={disabled}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      {!isValid && value && (
        <p className="text-xs text-destructive">Please enter a valid URL</p>
      )}
      {description && isValid && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {allowInternal && (
        <p className="text-xs text-muted-foreground">
          Tip: Use / for internal links (e.g., /products)
        </p>
      )}
    </div>
  )
}
