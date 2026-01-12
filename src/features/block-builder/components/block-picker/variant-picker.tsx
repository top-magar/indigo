"use client"

import { Button } from "@/components/ui/button"
import { blockSchemas } from "../../utils/block-schemas"
import type { BlockType } from "@/types/blocks"

interface VariantPickerProps {
  blockType: BlockType
  onVariantSelect: (variant: string) => void
}

export function VariantPicker({ blockType, onVariantSelect }: VariantPickerProps) {
  const schema = blockSchemas.find(s => s.type === blockType)
  
  if (!schema) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schema.variants.map((variant) => (
        <Button
          key={variant.id}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-muted text-left"
          onClick={() => onVariantSelect(variant.id)}
        >
          {/* Placeholder for variant thumbnail */}
          <div className="w-full h-24 bg-muted rounded border flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Preview</span>
          </div>
          
          <div>
            <p className="font-medium text-sm">{variant.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {variant.description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  )
}