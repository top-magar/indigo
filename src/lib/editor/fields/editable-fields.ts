// Editable Fields Helper - Identifies which fields support inline editing

import type { FieldType, FieldConfig, FieldSchema } from "./types"
import type { BlockType } from "@/types/blocks"
import { BLOCK_FIELD_SCHEMAS } from "./block-fields"

/**
 * Field types that support inline editing
 */
const EDITABLE_FIELD_TYPES: FieldType[] = ["text", "textarea"]

/**
 * Checks if a field type supports inline editing
 * @param fieldType - The type of the field
 * @returns true if the field type is 'text' or 'textarea'
 */
export function isEditableField(fieldType: FieldType): boolean {
  return EDITABLE_FIELD_TYPES.includes(fieldType)
}

/**
 * Checks if a field is multiline (textarea)
 * @param fieldType - The type of the field
 * @returns true if the field type is 'textarea'
 */
export function isMultilineField(fieldType: FieldType): boolean {
  return fieldType === "textarea"
}

/**
 * Represents an editable field with its path and configuration
 */
export interface EditableFieldInfo {
  path: string
  type: FieldType
  label: string
  multiline: boolean
  placeholder?: string
}

/**
 * Gets all editable field paths for a given block type
 * @param blockType - The type of block
 * @returns Array of editable field info objects
 */
export function getEditableFields(blockType: BlockType): EditableFieldInfo[] {
  const schema = BLOCK_FIELD_SCHEMAS[blockType]
  if (!schema) return []

  const editableFields: EditableFieldInfo[] = []

  // Iterate through top-level fields
  for (const [fieldPath, fieldConfig] of Object.entries(schema)) {
    if (isEditableField(fieldConfig.type)) {
      editableFields.push({
        path: fieldPath,
        type: fieldConfig.type,
        label: fieldConfig.label,
        multiline: isMultilineField(fieldConfig.type),
        placeholder: fieldConfig.placeholder,
      })
    }
  }

  return editableFields
}

/**
 * Gets the field configuration for a specific field path in a block
 * @param blockType - The type of block
 * @param fieldPath - The path to the field (e.g., "headline", "settings.items[0].title")
 * @returns The field configuration or undefined if not found
 */
export function getFieldConfig(
  blockType: BlockType,
  fieldPath: string
): FieldConfig | undefined {
  const schema = BLOCK_FIELD_SCHEMAS[blockType]
  if (!schema) return undefined

  // For simple paths (no dots or brackets), return directly
  if (!fieldPath.includes(".") && !fieldPath.includes("[")) {
    return schema[fieldPath]
  }

  // For nested paths, we need to traverse the schema
  // This handles paths like "settings.items[0].title"
  const parts = fieldPath.split(/\.|\[|\]/).filter(Boolean)
  let current: FieldConfig | FieldSchema | undefined = schema

  for (const part of parts) {
    if (!current) return undefined

    // Skip numeric indices (array access)
    if (/^\d+$/.test(part)) continue

    if ("type" in current) {
      // Current is a FieldConfig
      const fieldConfig = current as FieldConfig
      if (fieldConfig.type === "array") {
        const arrayField = fieldConfig as { itemFields?: Record<string, FieldConfig> }
        if (arrayField.itemFields) {
          current = arrayField.itemFields[part]
        } else {
          return undefined
        }
      } else if (fieldConfig.type === "object") {
        const objectField = fieldConfig as { fields?: Record<string, FieldConfig> }
        if (objectField.fields) {
          current = objectField.fields[part]
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    } else {
      // Current is a FieldSchema (Record<string, FieldConfig>)
      const schemaRecord = current as FieldSchema
      current = schemaRecord[part]
    }
  }

  if (current && typeof current === "object" && "type" in current) {
    return current as FieldConfig
  }
  return undefined
}

/**
 * Checks if a specific field in a block is editable
 * @param blockType - The type of block
 * @param fieldPath - The path to the field
 * @returns true if the field exists and is editable
 */
export function isFieldEditable(
  blockType: BlockType,
  fieldPath: string
): boolean {
  const config = getFieldConfig(blockType, fieldPath)
  return config ? isEditableField(config.type) : false
}
