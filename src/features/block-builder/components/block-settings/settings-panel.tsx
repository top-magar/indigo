"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Trash2 } from "lucide-react"
import { useBuilderStore } from "../../hooks/use-builder-store"
import { SettingsForm } from "./settings-form"

export function SettingsPanel() {
  const {
    document,
    selectedBlockId,
    isSettingsOpen,
    closeSettings,
    duplicateBlock,
    removeBlock,
  } = useBuilderStore()

  const selectedBlock = document?.blocks.find(b => b.id === selectedBlockId)

  if (!selectedBlock) {
    return (
      <Sheet open={isSettingsOpen} onOpenChange={closeSettings}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>No Block Selected</SheetTitle>
          </SheetHeader>
          <p className="text-sm text-muted-foreground mt-4">
            Select a block from the list to edit its settings.
          </p>
        </SheetContent>
      </Sheet>
    )
  }

  const handleDuplicate = () => {
    duplicateBlock(selectedBlock.id)
    closeSettings()
  }

  const handleDelete = () => {
    removeBlock(selectedBlock.id)
    closeSettings()
  }

  return (
    <Sheet open={isSettingsOpen} onOpenChange={closeSettings}>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {getBlockDisplayName(selectedBlock.type)} Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Settings form */}
          <SettingsForm block={selectedBlock} />

          <Separator />

          {/* Block actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="w-full gap-2"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate Block
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Block
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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