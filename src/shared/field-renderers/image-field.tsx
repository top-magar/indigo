"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Image, X, Link2 } from "lucide-react"
import { cn } from "@/shared/utils"
import type { ImageFieldProps } from "./types"

/**
 * Shared ImageField component used by the Visual Editor.
 * Provides consistent image URL input with preview and media library integration.
 */
export function ImageField({
  label,
  value,
  onChange,
  description,
  disabled = false,
  required = false,
  placeholder = "Enter image URL or choose from media",
  onMediaLibraryClick,
  showPreview = true,
  previewAspectRatio = "16/9",
  className,
}: ImageFieldProps) {
  const id = React.useId()
  const [imageError, setImageError] = React.useState(false)

  // Reset error when value changes
  React.useEffect(() => {
    setImageError(false)
  }, [value])

  const handleClear = () => {
    onChange("")
    setImageError(false)
  }

  const hasValidImage = value && !imageError

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {/* Image Preview */}
      {showPreview && (
        <div
          className={cn(
            "relative overflow-hidden rounded-md border bg-muted",
            !hasValidImage && "flex items-center justify-center"
          )}
          style={{ aspectRatio: previewAspectRatio }}
        >
          {hasValidImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => window.open(value, "_blank")}
                    disabled={disabled}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={handleClear}
                    disabled={disabled}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
              <Image className="h-8 w-8" />
              <span className="text-xs">No image selected</span>
            </div>
          )}
        </div>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          size="sm"
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Media Library Button */}
      {onMediaLibraryClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onMediaLibraryClick}
          disabled={disabled}
        >
          <Image className="h-4 w-4 mr-2" />
          Choose from Media
        </Button>
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
