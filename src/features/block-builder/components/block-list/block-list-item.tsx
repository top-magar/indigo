"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GripVertical, MoreHorizontal, Settings, Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useBuilderStore } from "../../hooks/use-builder-store"
import { getBlockIcon } from "../../utils/block-icons"
import { cn } from "@/shared/utils"
import type { BuilderBlock } from "../../types"

interface BlockListItemProps {
  block: BuilderBlock
}

export function BlockListItem({ block }: BlockListItemProps) {
  const {
    selectedBlockId,
    selectBlock,
    openSettings,
    duplicateBlock,
    toggleBlockVisibility,
    removeBlock,
    openBlockPicker,
  } = useBuilderStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSelected = selectedBlockId === block.id
  const BlockIcon = getBlockIcon(block.type)

  const handleSelect = () => {
    selectBlock(block.id)
  }

  const handleSettings = () => {
    selectBlock(block.id)
    openSettings()
  }

  const handleDuplicate = () => {
    duplicateBlock(block.id)
  }

  const handleToggleVisibility = () => {
    toggleBlockVisibility(block.id)
  }

  const handleDelete = () => {
    removeBlock(block.id)
  }

  const handleAddAfter = () => {
    openBlockPicker(block.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-xl border p-2 transition-colors hover:bg-muted/50",
        isSelected && "bg-muted border-primary",
        isDragging && "opacity-50",
        !block.visible && "opacity-60"
      )}
    >
      {/* Drag handle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </Button>

      {/* Block icon and info */}
      <div 
        className="flex items-center gap-2 flex-1 cursor-pointer"
        onClick={handleSelect}
      >
        <div className={cn(
          "flex h-6 w-6 items-center justify-center rounded border",
          !block.visible && "opacity-50"
        )}>
          <BlockIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            !block.visible && "line-through opacity-75"
          )}>
            {getBlockDisplayName(block.type)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {block.variant}
          </p>
        </div>
      </div>

      {/* Visibility indicator */}
      {!block.visible && (
        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
      )}

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="h-3.5 w-3.5 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddAfter}>
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add block after
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleVisibility}>
            {block.visible ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-2" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-2" />
                Show
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function getBlockDisplayName(type: string): string {
  const names: Record<string, string> = {
    header: "Header",
    hero: "Hero Section",
    "featured-product": "Featured Product",
    "product-grid": "Product Grid",
    "promotional-banner": "Promo Banner",
    testimonials: "Testimonials",
    "trust-signals": "Trust Signals",
    newsletter: "Newsletter",
    footer: "Footer",
    "rich-text": "Rich Text",
    image: "Image",
    button: "Button",
    video: "Video",
    faq: "FAQ",
    gallery: "Gallery",
  }
  return names[type] || type
}