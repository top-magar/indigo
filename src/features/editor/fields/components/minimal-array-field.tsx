"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { MinimalAutoField } from "./minimal-auto-field"
import type { ArrayField as ArrayFieldConfig } from "../types"

interface MinimalArrayFieldProps {
  config: ArrayFieldConfig
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
}

export function MinimalArrayField({ config, value, onChange }: MinimalArrayFieldProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))
  const items = value || []

  const addItem = () => {
    const newItem: Record<string, unknown> = {}
    // Initialize with default values
    Object.entries(config.itemFields).forEach(([key, fieldConfig]) => {
      if (fieldConfig.defaultValue !== undefined) {
        newItem[key] = fieldConfig.defaultValue
      }
    })
    const newItems = [...items, newItem]
    onChange(newItems)
    setExpandedItems(prev => new Set([...prev, newItems.length - 1]))
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
    setExpandedItems(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const updateItem = (index: number, key: string, itemValue: unknown) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [key]: itemValue }
    onChange(newItems)
  }

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{config.label}</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addItem}
          disabled={!!(config.maxItems && items.length >= config.maxItems)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">
          No {config.itemLabel?.toLowerCase() || 'items'} yet
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => {
            const isExpanded = expandedItems.has(index)
            const itemLabel = config.itemLabel || 'Item'
            
            return (
              <div key={index} className="border rounded-xl">
                <div className="flex items-center justify-between p-2 bg-muted/30">
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="flex items-center gap-2 text-xs font-medium flex-1 text-left"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    {itemLabel} {index + 1}
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="p-3 space-y-3 border-t">
                    {Object.entries(config.itemFields).map(([key, fieldConfig]) => (
                      <MinimalAutoField
                        key={key}
                        config={fieldConfig}
                        value={item[key]}
                        onChange={(itemValue) => updateItem(index, key, itemValue)}
                        allValues={item}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}