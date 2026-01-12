// Block Defaults - Provides default settings for each block type
import { blockSchemas } from "./block-schemas"
import type { BlockType } from "@/types/blocks"

/**
 * Get default settings for a block type and variant
 */
export function getBlockDefaults(type: BlockType, variant: string): Record<string, unknown> {
  const schema = blockSchemas.find(s => s.type === type)
  if (!schema) return {}

  const defaults: Record<string, unknown> = {}

  // Apply field defaults from all field groups
  Object.values(schema.fields).forEach(fieldGroup => {
    fieldGroup.forEach(field => {
      if (field.default !== undefined) {
        defaults[field.id] = field.default
      }
    })
  })

  return defaults
}