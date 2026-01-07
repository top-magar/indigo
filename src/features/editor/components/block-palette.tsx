"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Search01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { BLOCK_REGISTRY } from "@/components/store/blocks/registry"
import { BLOCK_ICONS, BLOCK_PALETTE_COLORS } from "@/features/editor/block-constants"
import type { BlockType } from "@/types/blocks"
import { cn } from "@/shared/utils"

interface BlockPaletteProps {
  onAddBlock: (type: BlockType, variant: string) => void
  existingBlockTypes: BlockType[]
}

export function BlockPalette({ onAddBlock, existingBlockTypes }: BlockPaletteProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<BlockType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const blockTypes = Object.entries(BLOCK_REGISTRY)
  
  const filteredBlocks = blockTypes.filter(([type, meta]) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      meta.name.toLowerCase().includes(query) ||
      meta.description.toLowerCase().includes(query) ||
      type.toLowerCase().includes(query)
    )
  })

  const handleAddBlock = (type: BlockType, variant: string) => {
    onAddBlock(type, variant)
    setOpen(false)
    setSelectedType(null)
    setSearchQuery("")
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedType(null)
    setSearchQuery("")
  }

  const selectedMeta = selectedType ? BLOCK_REGISTRY[selectedType] : null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
      else setOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={(e) => e.stopPropagation()}
        >
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {selectedType && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setSelectedType(null)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>
                {selectedType ? `Add ${selectedMeta?.name}` : "Add Block"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {selectedType 
                  ? "Choose a variant style for this block"
                  : "Select a block type to add to your storefront"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {!selectedType ? (
            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <HugeiconsIcon 
                  icon={Search01Icon} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                />
                <Input
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Block list */}
              <div className="space-y-1.5">
                {filteredBlocks.map(([type, meta]) => {
                  const blockType = type as BlockType
                  const isUnique = blockType === "header" || blockType === "footer"
                  const alreadyExists = existingBlockTypes.includes(blockType)
                  const isDisabled = isUnique && alreadyExists

                  return (
                    <button
                      key={type}
                      onClick={() => !isDisabled && setSelectedType(blockType)}
                      disabled={isDisabled}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        isDisabled 
                          ? "cursor-not-allowed opacity-50 bg-muted/50" 
                          : "hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                        BLOCK_PALETTE_COLORS[blockType]
                      )}>
                        <HugeiconsIcon icon={BLOCK_ICONS[blockType]} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{meta.name}</span>
                          {isDisabled && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Added
                            </Badge>
                          )}
                          {isUnique && !alreadyExists && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Unique
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {meta.description}
                        </p>
                      </div>
                      {!isDisabled && (
                        <HugeiconsIcon 
                          icon={Add01Icon} 
                          className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" 
                        />
                      )}
                    </button>
                  )
                })}
                
                {filteredBlocks.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No blocks found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Variant selection */
            <div className="p-4 space-y-2">
              {selectedMeta?.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleAddBlock(selectedType, variant.id)}
                  className="group flex w-full flex-col items-start rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-sm">{variant.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-primary">Add</span>
                      <HugeiconsIcon 
                        icon={Add01Icon} 
                        className="h-4 w-4 text-primary" 
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {variant.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}