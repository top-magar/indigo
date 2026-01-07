"use client"

import type { FieldConfig } from "../types"
import { MinimalTextField } from "./minimal-text-field"
import { MinimalTextareaField } from "./minimal-textarea-field"
import { MinimalNumberField } from "./minimal-number-field"
import { MinimalBooleanField } from "./minimal-boolean-field"
import { MinimalSelectField } from "./minimal-select-field"
import { MinimalColorField } from "./minimal-color-field"
import { MinimalImageField } from "./minimal-image-field"
import { MinimalArrayField } from "./minimal-array-field"
// Import existing components for types not yet minimized
import { RichtextField } from "./richtext-field"
import { UrlField } from "./url-field"
import { IconField } from "./icon-field"
import { ProductField } from "./product-field"
import { ProductsField } from "./products-field"
import { CollectionField } from "./collection-field"
import { ObjectField } from "./object-field"

interface MinimalAutoFieldProps {
  config: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  allValues?: Record<string, unknown>
}

export function MinimalAutoField({ config, value, onChange, allValues = {} }: MinimalAutoFieldProps) {
  // Check condition if present
  if (config.condition && !config.condition(allValues)) {
    return null
  }

  // Check showWhen condition
  if (config.showWhen) {
    const { field, value: expectedValue, values: expectedValues } = config.showWhen as any
    const fieldValue = allValues[field]
    
    if (expectedValues) {
      if (!expectedValues.includes(fieldValue)) return null
    } else if (fieldValue !== expectedValue) {
      return null
    }
  }

  switch (config.type) {
    case "text":
      return (
        <MinimalTextField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "textarea":
      return (
        <MinimalTextareaField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "number":
      return (
        <MinimalNumberField
          config={config}
          value={value as number}
          onChange={onChange}
        />
      )

    case "boolean":
      return (
        <MinimalBooleanField
          config={config}
          value={value as boolean}
          onChange={onChange}
        />
      )

    case "select":
      return (
        <MinimalSelectField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "color":
      return (
        <MinimalColorField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "image":
      return (
        <MinimalImageField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    // For now, use existing components for complex types
    case "richtext":
      return (
        <div className="space-y-1.5">
          <RichtextField
            name={config.label}
            config={config}
            value={value as string}
            onChange={onChange}
          />
        </div>
      )

    case "url":
      return (
        <div className="space-y-1.5">
          <UrlField
            config={config}
            value={value as string}
            onChange={onChange}
          />
        </div>
      )

    case "icon":
      return (
        <div className="space-y-1.5">
          <IconField
            config={config}
            value={value as string}
            onChange={onChange}
          />
        </div>
      )

    case "product":
      return (
        <div className="space-y-1.5">
          <ProductField
            config={config}
            value={value as string}
            onChange={onChange}
          />
        </div>
      )

    case "products":
      return (
        <div className="space-y-1.5">
          <ProductsField
            config={config}
            value={value as string[]}
            onChange={onChange}
          />
        </div>
      )

    case "collection":
      return (
        <div className="space-y-1.5">
          <CollectionField
            config={config}
            value={value as string}
            onChange={onChange}
          />
        </div>
      )

    case "array":
      return (
        <MinimalArrayField
          config={config}
          value={value as Record<string, unknown>[]}
          onChange={onChange}
        />
      )

    case "object":
      return (
        <div className="space-y-1.5">
          <ObjectField
            config={config}
            value={value as Record<string, unknown>}
            onChange={onChange}
          />
        </div>
      )

    default:
      return (
        <div className="text-xs text-muted-foreground">
          Unknown field type: {(config as FieldConfig).type}
        </div>
      )
  }
}