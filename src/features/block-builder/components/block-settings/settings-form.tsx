"use client"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useBuilderStore } from "../../hooks/use-builder-store"
import { blockSchemas } from "../../utils/block-schemas"
import { FieldRenderer } from "./field-renderer"
import type { BuilderBlock } from "../../types"

interface SettingsFormProps {
  block: BuilderBlock
}

export function SettingsForm({ block }: SettingsFormProps) {
  const { updateBlock } = useBuilderStore()

  const schema = blockSchemas.find(s => s.type === block.type)
  
  if (!schema) {
    return (
      <div className="text-sm text-muted-foreground">
        No settings available for this block type.
      </div>
    )
  }

  const handleFieldChange = (fieldId: string, value: unknown) => {
    updateBlock(block.id, {
      data: {
        ...block.data,
        [fieldId]: value,
      }
    })
  }

  const handleVariantChange = (variant: string) => {
    updateBlock(block.id, { variant })
  }

  return (
    <div className="space-y-6">
      {/* Variant selector */}
      {schema.variants.length > 1 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Variant</Label>
          <select
            value={block.variant}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
          >
            {schema.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Field groups */}
      {Object.entries(schema.fields).map(([groupName, fields], groupIndex) => (
        <div key={groupName}>
          {groupIndex > 0 && <Separator />}
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm capitalize">{groupName}</h4>
            
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {field.description && (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                )}
                
                <FieldRenderer
                  field={field}
                  value={block.data[field.id] ?? field.default}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}