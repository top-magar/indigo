"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon, ArrowDown01Icon, DragDropVerticalIcon } from "@hugeicons/core-free-icons"
import type { ArrayField as ArrayFieldConfig, FieldConfig } from "../types"
import { AutoField } from "./auto-field"
import { cn } from "@/shared/utils"

interface ArrayFieldProps {
  config: ArrayFieldConfig
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
}

export function ArrayField({ config, value, onChange }: ArrayFieldProps) {
  // Ensure value is always an array
  const items = Array.isArray(value) ? value : []
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]))

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems)
    if (newOpen.has(index)) {
      newOpen.delete(index)
    } else {
      newOpen.add(index)
    }
    setOpenItems(newOpen)
  }

  const addItem = () => {
    if (config.maxItems && items.length >= config.maxItems) return
    
    // Create new item with default values from field configs
    const newItem: Record<string, unknown> = {}
    Object.entries(config.itemFields).forEach(([key, fieldConfig]) => {
      if (fieldConfig.defaultValue !== undefined) {
        newItem[key] = fieldConfig.defaultValue
      } else {
        newItem[key] = ""
      }
    })
    
    const newValue = [...items, newItem]
    onChange(newValue)
    setOpenItems(new Set([...openItems, newValue.length - 1]))
  }

  const removeItem = (index: number) => {
    if (config.minItems && items.length <= config.minItems) return
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, key: string, itemValue: unknown) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: itemValue }
    onChange(updated)
  }

  const canAdd = !config.maxItems || items.length < config.maxItems
  const canRemove = !config.minItems || items.length > config.minItems

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{config.label}</Label>
        {config.maxItems && (
          <span className="text-xs text-muted-foreground">
            {items.length}/{config.maxItems}
          </span>
        )}
      </div>

      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <Collapsible
            key={index}
            open={openItems.has(index)}
            onOpenChange={() => toggleItem(index)}
          >
            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
                  <HugeiconsIcon icon={DragDropVerticalIcon} className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Badge variant="secondary" className="text-xs">
                    {config.itemLabel || "Item"} {index + 1}
                  </Badge>
                  <span className="flex-1 text-left text-sm text-muted-foreground truncate">
                    {getItemPreview(item, config.itemFields)}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      openItems.has(index) && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 pt-0 space-y-4 border-t">
                  {Object.entries(config.itemFields).map(([key, fieldConfig]) => (
                    <AutoField
                      key={key}
                      config={fieldConfig}
                      value={item[key]}
                      onChange={(v) => updateItem(index, key, v)}
                    />
                  ))}
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(index)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                      Remove {config.itemLabel || "Item"}
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>

      {canAdd && (
        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
          Add {config.itemLabel || "Item"}
        </Button>
      )}
    </div>
  )
}

// Helper to get a preview string from an item
function getItemPreview(item: Record<string, unknown>, fields: Record<string, FieldConfig>): string {
  // Try to find a text field to use as preview
  const textFields = Object.entries(fields).filter(
    ([_, config]) => config.type === "text" || config.type === "textarea"
  )
  
  for (const [key] of textFields) {
    const value = item[key]
    if (typeof value === "string" && value.trim()) {
      return value.length > 40 ? value.slice(0, 40) + "..." : value
    }
  }
  
  return ""
}
