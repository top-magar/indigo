"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image, Trash2 } from "lucide-react"
import type { ImageField as ImageFieldConfig } from "../types"

interface MinimalImageFieldProps {
  config: ImageFieldConfig
  value: string
  onChange: (value: string) => void
}

export function MinimalImageField({ config, value, onChange }: MinimalImageFieldProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you'd upload this to your storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      onChange(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onChange(url)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{config.label}</Label>
      
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-24 object-cover rounded border"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-1 right-1 h-6 w-6 p-0"
            onClick={() => onChange("")}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-2">
            Drop image here or click to select
          </p>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-${config.label}`}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => document.getElementById(`image-${config.label}`)?.click()}
          >
            Select Image
          </Button>
        </div>
      )}
    </div>
  )
}