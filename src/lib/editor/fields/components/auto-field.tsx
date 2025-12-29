"use client"

import type { FieldConfig } from "../types"
import { TextField } from "./text-field"
import { TextareaField } from "./textarea-field"
import { RichtextField } from "./richtext-field"
import { NumberField } from "./number-field"
import { BooleanField } from "./boolean-field"
import { SelectField } from "./select-field"
import { ColorField } from "./color-field"
import { ImageField } from "./image-field"
import { UrlField } from "./url-field"
import { IconField } from "./icon-field"
import { ProductField } from "./product-field"
import { ProductsField } from "./products-field"
import { CollectionField } from "./collection-field"
import { ArrayField } from "./array-field"
import { ObjectField } from "./object-field"

interface AutoFieldProps {
  config: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
  allValues?: Record<string, unknown> // For conditional fields
}

export function AutoField({ config, value, onChange, allValues = {} }: AutoFieldProps) {
  // Check condition if present
  if (config.condition && !config.condition(allValues)) {
    return null
  }

  switch (config.type) {
    case "text":
      return (
        <TextField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "textarea":
      return (
        <TextareaField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "richtext":
      return (
        <RichtextField
          name={config.label}
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "number":
      return (
        <NumberField
          config={config}
          value={value as number}
          onChange={onChange}
        />
      )

    case "boolean":
      return (
        <BooleanField
          config={config}
          value={value as boolean}
          onChange={onChange}
        />
      )

    case "select":
      return (
        <SelectField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "color":
      return (
        <ColorField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "image":
      return (
        <ImageField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "url":
      return (
        <UrlField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "icon":
      return (
        <IconField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "product":
      return (
        <ProductField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "products":
      return (
        <ProductsField
          config={config}
          value={value as string[]}
          onChange={onChange}
        />
      )

    case "collection":
      return (
        <CollectionField
          config={config}
          value={value as string}
          onChange={onChange}
        />
      )

    case "array":
      return (
        <ArrayField
          config={config}
          value={value as Record<string, unknown>[]}
          onChange={onChange}
        />
      )

    case "object":
      return (
        <ObjectField
          config={config}
          value={value as Record<string, unknown>}
          onChange={onChange}
        />
      )

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown field type: {(config as FieldConfig).type}
        </div>
      )
  }
}
