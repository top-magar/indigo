"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useBuilderStore } from "../../hooks/use-builder-store"
import { BlockCategory } from "./block-category"
import { VariantPicker } from "./variant-picker"
import { blockSchemas } from "../../utils/block-schemas"
import type { BlockType } from "@/types/blocks"

export function BlockPicker() {
  const {
    isBlockPickerOpen,
    insertAfterBlockId,
    closeBlockPicker,
    addBlock,
  } = useBuilderStore()

  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null)

  const handleBlockTypeSelect = (type: BlockType) => {
    const schema = blockSchemas.find(s => s.type === type)
    if (!schema) return

    // If block has only one variant, add it directly
    if (schema.variants.length === 1) {
      addBlock(type, schema.variants[0].id, insertAfterBlockId)
      handleClose()
    } else {
      setSelectedBlockType(type)
    }
  }

  const handleVariantSelect = (variant: string) => {
    if (!selectedBlockType) return
    addBlock(selectedBlockType, variant, insertAfterBlockId)
    handleClose()
  }

  const handleClose = () => {
    setSelectedBlockType(null)
    closeBlockPicker()
  }

  const handleBack = () => {
    setSelectedBlockType(null)
  }

  if (!isBlockPickerOpen) return null

  return (
    <Dialog open={isBlockPickerOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle>
            {selectedBlockType ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-1 h-auto"
                >
                  ←
                </Button>
                Choose {blockSchemas.find(s => s.type === selectedBlockType)?.name} Style
              </div>
            ) : (
              "Add Block"
            )}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto">
          {selectedBlockType ? (
            <VariantPicker
              blockType={selectedBlockType}
              onVariantSelect={handleVariantSelect}
            />
          ) : (
            <div className="space-y-8">
              <BlockCategory
                category="layout"
                title="Layout"
                onBlockSelect={handleBlockTypeSelect}
              />
              <BlockCategory
                category="content"
                title="Content"
                onBlockSelect={handleBlockTypeSelect}
              />
              <BlockCategory
                category="commerce"
                title="Commerce"
                onBlockSelect={handleBlockTypeSelect}
              />
              <BlockCategory
                category="engagement"
                title="Engagement"
                onBlockSelect={handleBlockTypeSelect}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}