"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { BlockFieldSchema } from "../../types"

interface FieldRendererProps {
  field: BlockFieldSchema
  value: unknown
  onChange: (value: unknown) => void
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  switch (field.type) {
    case "text":
      return (
        <Input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )

    case "textarea":
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
        />
      )

    case "number":
      return (
        <Input
          type="number"
          value={(value as number) || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
        />
      )

    case "select":
      return (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )

    case "toggle":
      return (
        <Switch
          checked={(value as boolean) || false}
          onCheckedChange={onChange}
        />
      )

    case "color":
      return (
        <div className="flex gap-2">
          <Input
            type="color"
            value={(value as string) || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 p-1 border rounded"
          />
          <Input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      )

    case "image":
      return (
        <div className="space-y-2">
          <Input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {value && typeof value === 'string' && value.length > 0 ? (
            <div className="w-full h-24 bg-muted rounded border overflow-hidden">
              <img
                src={value as string}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ) : null}
        </div>
      )

    case "link":
      return (
        <Input
          type="url"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com or /page"
        />
      )

    case "richtext":
      return (
        <Textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={6}
        />
      )

    case "product":
      return (
        <Input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Product ID"
        />
      )

    case "collection":
      return (
        <Input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Collection ID"
        />
      )

    case "array":
      // Simplified array handling - just show as JSON for now
      return (
        <Textarea
          value={JSON.stringify(value || [], null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              onChange(parsed)
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder="[]"
          rows={4}
        />
      )

    default:
      return (
        <Input
          type="text"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
  }
}