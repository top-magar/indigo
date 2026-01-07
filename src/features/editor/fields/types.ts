// Auto-Field System Types

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "image"
  | "url"
  | "icon"
  | "array"
  | "object"
  | "product"
  | "collection"
  | "products"

export interface BaseFieldConfig {
  type: FieldType
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  defaultValue?: unknown
  condition?: (values: Record<string, unknown>) => boolean
  /** Conditional visibility based on another field's value */
  showWhen?: { field: string; value: unknown } | { field: string; values: unknown[] }
}

export interface TextField extends BaseFieldConfig {
  type: "text"
  maxLength?: number
  minLength?: number
}

export interface TextareaField extends BaseFieldConfig {
  type: "textarea"
  rows?: number
  maxLength?: number
}

export interface RichtextField extends BaseFieldConfig {
  type: "richtext"
  toolbar?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strike?: boolean
    heading?: boolean | { levels: (1 | 2 | 3 | 4 | 5 | 6)[] }
    bulletList?: boolean
    orderedList?: boolean
    link?: boolean
    textAlign?: boolean
    code?: boolean
  }
}

export interface NumberField extends BaseFieldConfig {
  type: "number"
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export interface BooleanField extends BaseFieldConfig {
  type: "boolean"
}

export interface SelectField extends BaseFieldConfig {
  type: "select"
  options: { label: string; value: string }[]
}

export interface ColorField extends BaseFieldConfig {
  type: "color"
  presets?: string[]
}

export interface ImageField extends BaseFieldConfig {
  type: "image"
  aspectRatio?: string
  maxSize?: number // in MB
}

export interface UrlField extends BaseFieldConfig {
  type: "url"
  allowInternal?: boolean
}

export interface IconField extends BaseFieldConfig {
  type: "icon"
  icons: string[]
}

export interface ArrayField extends BaseFieldConfig {
  type: "array"
  itemFields: Record<string, FieldConfig>
  maxItems?: number
  minItems?: number
  itemLabel?: string
}

export interface ObjectField extends BaseFieldConfig {
  type: "object"
  fields: Record<string, FieldConfig>
}

export interface ProductField extends BaseFieldConfig {
  type: "product"
}

export interface CollectionField extends BaseFieldConfig {
  type: "collection"
}

export interface ProductsField extends BaseFieldConfig {
  type: "products"
  maxItems?: number
}

export type FieldConfig =
  | TextField
  | TextareaField
  | RichtextField
  | NumberField
  | BooleanField
  | SelectField
  | ColorField
  | ImageField
  | UrlField
  | IconField
  | ArrayField
  | ObjectField
  | ProductField
  | CollectionField
  | ProductsField

export type FieldSchema = Record<string, FieldConfig>

// Block field definitions
export interface BlockFieldDefinition {
  type: string
  name: string
  fields: FieldSchema
}
