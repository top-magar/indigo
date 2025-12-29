"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  RefreshIcon,
  File01Icon,
  LayoutTopIcon,
  LayoutBottomIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { nanoid } from "nanoid"
import { useEditorStore } from "@/lib/editor/store"
import { TEMPLATE_LIST, templateToLayout, type TemplateId } from "@/components/store/blocks/templates"
import type { StoreBlock } from "@/types/blocks"

type StartOption = "blank" | "header-footer" | "template"

interface StartFreshDialogProps {
  storeSlug: string
  trigger?: React.ReactNode
}

// Minimal header block
const createMinimalHeader = (): StoreBlock => ({
  id: nanoid(),
  type: "header",
  variant: "minimal",
  order: 0,
  visible: true,
  settings: {
    navLinks: [{ label: "Shop", href: "/products" }],
    showSearch: true,
    showAccount: true,
    sticky: true,
  },
})

// Minimal footer block
const createMinimalFooter = (): StoreBlock => ({
  id: nanoid(),
  type: "footer",
  variant: "centered",
  order: 1,
  visible: true,
  settings: {
    columns: [],
    socialLinks: [],
    showPaymentIcons: true,
    showNewsletter: false,
    legalLinks: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
})

export function StartFreshDialog({ storeSlug, trigger }: StartFreshDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<StartOption>("header-footer")
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern-minimal")

  const blocks = useEditorStore((s) => s.blocks)
  const setBlocks = useEditorStore((s) => s.setBlocks)
  const clearSelection = useEditorStore((s) => s.clearSelection)

  const hasBlocks = blocks.length > 0

  const handleStartFresh = () => {
    if (hasBlocks) {
      setConfirmOpen(true)
    } else {
      applyStartOption()
    }
  }

  const applyStartOption = () => {
    clearSelection()

    switch (selectedOption) {
      case "blank":
        setBlocks([])
        toast.success("Started with blank canvas")
        break

      case "header-footer":
        setBlocks([createMinimalHeader(), createMinimalFooter()])
        toast.success("Started with header and footer")
        break

      case "template":
        const template = TEMPLATE_LIST.find((t) => t.id === selectedTemplate)
        if (template) {
          const layout = templateToLayout(template, storeSlug)
          setBlocks(layout.blocks)
          toast.success(`Applied "${template.name}" template`)
        }
        break
    }

    setOpen(false)
    setConfirmOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="gap-2">
              <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
              Start Fresh
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start Fresh</DialogTitle>
            <DialogDescription>
              Choose how you want to start building your storefront
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            value={selectedOption}
            onValueChange={(v) => setSelectedOption(v as StartOption)}
            className="space-y-3 py-4"
          >
            {/* Blank Canvas */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="blank" id="blank" className="mt-1" />
              <Label htmlFor="blank" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={File01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Blank Canvas</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Start completely empty and build from scratch
                </p>
              </Label>
            </div>

            {/* Header + Footer */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="header-footer" id="header-footer" className="mt-1" />
              <Label htmlFor="header-footer" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <HugeiconsIcon icon={LayoutTopIcon} className="h-4 w-4 text-blue-500" />
                    <span className="mx-1 text-muted-foreground">+</span>
                    <HugeiconsIcon icon={LayoutBottomIcon} className="h-4 w-4 text-slate-500" />
                  </div>
                  <span className="font-medium">Header + Footer</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with minimal header and footer, add content in between
                </p>
              </Label>
            </div>

            {/* From Template */}
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="template" id="template" className="mt-1" />
              <Label htmlFor="template" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">From Template</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with a pre-designed template layout
                </p>
              </Label>
            </div>
          </RadioGroup>

          {/* Template selector */}
          {selectedOption === "template" && (
            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <Label className="text-xs text-muted-foreground">Select Template</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_LIST.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-md border text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className="text-sm font-medium block">{template.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {template.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartFresh}>
              {hasBlocks ? "Replace Current Layout" : "Start Building"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Current Layout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {blocks.length} existing block(s) and start fresh.
              This action cannot be undone unless you have saved your current layout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyStartOption}>
              Yes, Start Fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
