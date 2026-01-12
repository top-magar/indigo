"use client"

import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useBuilderStore } from "../../hooks/use-builder-store"
import { BlockListItem } from "./block-list-item"

export function BlockList() {
  const {
    document,
    reorderBlocks,
    openBlockPicker,
  } = useBuilderStore()

  const blocks = document?.blocks ?? []

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    reorderBlocks(active.id as string, over.id as string)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold text-sm">Blocks</h2>
        <span className="text-xs text-muted-foreground">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No blocks yet
            </p>
            <Button
              size="sm"
              onClick={() => openBlockPicker()}
              className="gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your first block
            </Button>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {blocks
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <BlockListItem
                      key={block.id}
                      block={block}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add block button */}
      {blocks.length > 0 && (
        <div className="border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openBlockPicker()}
            className="w-full gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </Button>
        </div>
      )}
    </div>
  )
}