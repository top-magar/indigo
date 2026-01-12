"use client"

import { useState, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Image, Upload, Trash2, Loader2, AlertCircle, FolderOpen } from "lucide-react"
import { cn } from "@/shared/utils"
import { MediaPicker } from "@/features/media/components"
import type { ImageField as ImageFieldConfig } from "../types"
import type { MediaAsset } from "@/features/media/types"

interface ImageFieldProps {
  config: ImageFieldConfig
  value: string
  onChange: (value: string) => void
}

export function ImageField({ config, value, onChange }: ImageFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        return "Please select an image file"
      }

      // Check file size (default 5MB)
      const maxSize = config.maxSize || 5
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }

      return null
    },
    [config.maxSize]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("file", file)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Upload failed")
        }

        const data = await response.json()
        onChange(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [validateFile, onChange]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
      // Reset input to allow selecting same file again
      e.target.value = ""
    },
    [uploadFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    [uploadFile]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            e.preventDefault()
            uploadFile(file)
            return
          }
        }
      }
    },
    [uploadFile]
  )

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      onChange(e.target.value)
    },
    [onChange]
  )

  const handleRemove = useCallback(() => {
    onChange("")
    setError(null)
  }, [onChange])

  const handleMediaSelect = useCallback(
    (assets: MediaAsset[]) => {
      if (assets.length > 0) {
        onChange(assets[0].cdnUrl)
        setError(null)
      }
    },
    [onChange]
  )

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>

      {value ? (
        <div className="relative rounded-xl border overflow-hidden bg-muted/30 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={() => setError("Failed to load image")}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPickerOpen(true)}
              disabled={isUploading}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Library
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Media Library Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => setPickerOpen(true)}
            disabled={isUploading}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Choose from Library
          </Button>

          {/* Upload Drop Zone */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50 hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-70"
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
          >
            {isUploading ? (
              <>
                <Loader2
                  className="h-8 w-8 text-primary mb-2 animate-spin"
                />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <div className="w-full max-w-[120px] h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <Image
                  className={cn(
                    "h-8 w-8 mb-2 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p className="text-sm text-muted-foreground text-center">
                  {isDragging ? "Drop image here" : "Or drag & drop to upload"}
                </p>
                {config.aspectRatio && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: {config.aspectRatio}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Max {config.maxSize || 5}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Input
        value={value || ""}
        onChange={handleUrlChange}
        onPaste={handlePaste}
        placeholder="Or paste image URL..."
        className="text-sm"
        disabled={isUploading}
      />

      {error && (
        <div className="flex items-center gap-1.5 text-destructive text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {config.description && !error && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleMediaSelect}
        mode="single"
        accept={["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]}
        title="Select Image"
      />
    </div>
  )
}
