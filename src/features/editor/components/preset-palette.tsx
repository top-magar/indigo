"use client"

import { useState, useMemo } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Grid3x3,
  Image,
  Shield,
  Mail,
  Columns2,
  Square,
  MessageSquare,
  HelpCircle,
  Video,
  Megaphone,
  Heart,
  MousePointer,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/utils"
import {
  BUILT_IN_PRESETS,
  getCustomPresets,
  deleteCustomPreset,
  instantiatePreset,
  type BlockPreset,
} from "@/features/editor/presets"
import { useEditorStore } from "@/features/editor/store"

// Icon mapping for presets
const PRESET_ICONS: Record<string, LucideIcon> = {
  Image01Icon: Image,
  ShieldIcon: Shield,
  LayoutTwoColumnIcon: Columns2,
  SquareIcon: Square,
  GridIcon: Grid3x3,
  MessageMultiple01Icon: MessageSquare,
  HelpCircleIcon: HelpCircle,
  Image02Icon: Image,
  Video01Icon: Video,
  Megaphone01Icon: Megaphone,
  FavouriteIcon: Heart,
  Mail01Icon: Mail,
  Cursor01Icon: MousePointer,
  Layers01Icon: Layers,
}

const CATEGORY_LABELS: Record<BlockPreset["category"], string> = {
  layout: "Layout",
  content: "Content",
  commerce: "Commerce",
  engagement: "Engagement",
  custom: "My Presets",
}

const CATEGORY_COLORS: Record<BlockPreset["category"], string> = {
  layout: "bg-[var(--ds-blue-700)]/10 text-[var(--ds-blue-700)]",
  content: "bg-[var(--ds-purple-700)]/10 text-[var(--ds-purple-700)]",
  commerce: "bg-[var(--ds-green-700)]/10 text-[var(--ds-green-700)]",
  engagement: "bg-[var(--ds-pink-700)]/10 text-[var(--ds-pink-700)]",
  custom: "bg-[var(--ds-amber-600)]/10 text-[var(--ds-amber-600)]",
}

interface PresetPaletteProps {
  trigger?: React.ReactNode
}

export function PresetPalette({ trigger }: PresetPaletteProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [deletePresetId, setDeletePresetId] = useState<string | null>(null)
  const [customPresets, setCustomPresets] = useState<BlockPreset[]>(() => getCustomPresets())

  const blocks = useEditorStore((s) => s.blocks)
  const setBlocks = useEditorStore((s) => s.setBlocks)

  // Combine built-in and custom presets
  const allPresets = useMemo(() => [...BUILT_IN_PRESETS, ...customPresets], [customPresets])

  // Filter presets
  const filteredPresets = useMemo(() => {
    let presets = allPresets

    // Filter by tab
    if (activeTab !== "all") {
      presets = presets.filter((p) => p.category === activeTab)
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    return presets
  }, [allPresets, activeTab, searchQuery])

  // Add preset to canvas
  const handleAddPreset = (preset: BlockPreset) => {
    const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) + 1 : 0
    const newBlocks = instantiatePreset(preset, maxOrder)
    setBlocks([...blocks, ...newBlocks])
    setOpen(false)
    setSearchQuery("")
  }

  // Delete custom preset
  const handleDeletePreset = (id: string) => {
    deleteCustomPreset(id)
    setCustomPresets(getCustomPresets())
    setDeletePresetId(null)
  }

  // Refresh custom presets when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCustomPresets(getCustomPresets())
    }
    setOpen(isOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4" />
              Presets
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Block Presets</DialogTitle>
            <DialogDescription>
              Add pre-built block combinations to quickly build your page
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search presets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 border-b">
              <TabsList className="h-10 w-full justify-start bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="layout"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  Layout
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="commerce"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  Commerce
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                >
                  Engagement
                </TabsTrigger>
                {customPresets.length > 0 && (
                  <TabsTrigger
                    value="custom"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
                  >
                    My Presets
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <ScrollArea className="h-[400px]">
              <TabsContent value={activeTab} className="m-0 p-4">
                {filteredPresets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Layers
                      className="h-12 w-12 text-muted-foreground/30 mb-4"
                    />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No presets found for "${searchQuery}"`
                        : "No presets in this category"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredPresets.map((preset) => {
                      const Icon = PRESET_ICONS[preset.icon] || Layers
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleAddPreset(preset)}
                          className="group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm"
                        >
                          <div className="flex w-full items-start justify-between">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                CATEGORY_COLORS[preset.category]
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {preset.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeletePresetId(preset.id)
                                  }}
                                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/10"
                                >
                                  <Trash2
                                    className="h-3.5 w-3.5 text-destructive"
                                  />
                                </button>
                              )}
                              <Plus
                                className="h-4 w-4 text-primary"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{preset.name}</span>
                              {preset.isCustom && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {preset.description}
                            </p>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px]", CATEGORY_COLORS[preset.category])}
                            >
                              {CATEGORY_LABELS[preset.category]}
                            </Badge>
                            <span className="ml-2 text-[10px] text-muted-foreground">
                              {preset.blocks.length} block{preset.blocks.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletePresetId} onOpenChange={() => setDeletePresetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Preset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this preset. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePresetId && handleDeletePreset(deletePresetId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
