"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"
import type { StoreBlock, BlockType } from "@/types/blocks"
import { getBlockFieldSchema } from "@/lib/editor/fields"
import { AutoField } from "@/lib/editor/fields/components"
import type { FieldConfig, FieldSchema } from "@/lib/editor/fields/types"

interface AutoSettingsPanelProps {
  block: StoreBlock | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: Record<string, unknown>) => void
}

// Group fields by category for better organization
function groupFields(schema: FieldSchema): Record<string, [string, FieldConfig][]> {
  const groups: Record<string, [string, FieldConfig][]> = {
    content: [],
    appearance: [],
    behavior: [],
    data: [],
    other: [],
  }

  Object.entries(schema).forEach(([key, config]) => {
    // Categorize based on field type and key patterns
    if (config.type === "boolean") {
      groups.behavior.push([key, config])
    } else if (config.type === "color" || config.type === "image" || key.includes("background") || key.includes("overlay")) {
      groups.appearance.push([key, config])
    } else if (config.type === "product" || config.type === "products" || config.type === "collection" || key.includes("Id")) {
      groups.data.push([key, config])
    } else if (config.type === "text" || config.type === "textarea" || config.type === "url") {
      groups.content.push([key, config])
    } else {
      groups.other.push([key, config])
    }
  })

  // Filter out empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, fields]) => fields.length > 0)
  )
}

const GROUP_LABELS: Record<string, string> = {
  content: "Content",
  appearance: "Appearance",
  behavior: "Options",
  data: "Data Source",
  other: "Settings",
}

export function AutoSettingsPanel({
  block,
  open,
  onOpenChange,
  onSave,
}: AutoSettingsPanelProps) {
  const [settings, setSettings] = useState<Record<string, unknown>>({})

  // Get field schema for this block type
  const fieldSchema = useMemo(() => {
    if (!block) return {}
    return getBlockFieldSchema(block.type as BlockType)
  }, [block?.type])

  // Group fields for organized display
  const groupedFields = useMemo(() => groupFields(fieldSchema), [fieldSchema])

  // Reset settings when block changes or dialog opens
  useEffect(() => {
    if (block && open) {
      setSettings({ ...block.settings })
    }
  }, [block, open])

  if (!block) return null

  const handleSave = () => {
    onSave(settings)
    onOpenChange(false)
  }

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const blockTitle = block.type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const hasFields = Object.keys(fieldSchema).length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{blockTitle} Settings</DialogTitle>
              <DialogDescription className="mt-0.5">
                Customize the content and appearance of this block
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6">
            {!hasFields ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <HugeiconsIcon icon={Settings02Icon} className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No settings available for this block type.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedFields).map(([groupKey, fields], groupIndex) => (
                  <div key={groupKey}>
                    {groupIndex > 0 && <Separator className="mb-8" />}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold">{GROUP_LABELS[groupKey] || groupKey}</h3>
                      </div>
                      <div className="space-y-4">
                        {fields.map(([key, config]) => (
                          <AutoField
                            key={key}
                            config={config}
                            value={settings[key]}
                            onChange={(value) => updateSetting(key, value)}
                            allValues={settings}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
