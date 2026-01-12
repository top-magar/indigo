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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bookmark, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { saveCustomPreset, type BlockPreset } from "@/features/editor/presets"
import { useEditorStore, selectSelectedBlockIds, selectBlocks } from "@/features/editor/store"
import { findBlockById } from "@/types/blocks"

interface SavePresetDialogProps {
  trigger?: React.ReactNode
}

export function SavePresetDialog({ trigger }: SavePresetDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<BlockPreset["category"]>("custom")
  const [saving, setSaving] = useState(false)

  const blocks = useEditorStore(selectBlocks)
  const selectedBlockIds = useEditorStore(selectSelectedBlockIds)

  // Get blocks to save (selected or all)
  const blocksToSave = selectedBlockIds.length > 0
    ? selectedBlockIds.map(id => findBlockById(blocks, id)).filter(Boolean)
    : blocks

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a preset name")
      return
    }

    if (blocksToSave.length === 0) {
      toast.error("No blocks to save")
      return
    }

    setSaving(true)

    try {
      // Remove IDs and orders from blocks for preset
      const presetBlocks = blocksToSave.map(block => {
        const { id, order, ...rest } = block as any
        return rest
      })

      saveCustomPreset({
        name: name.trim(),
        description: description.trim() || `Custom preset with ${presetBlocks.length} block(s)`,
        category,
        icon: "Layers01Icon",
        blocks: presetBlocks,
      })

      toast.success("Preset saved successfully", {
        description: `"${name}" has been added to your presets`,
        icon: <CheckCircle className="h-4 w-4 text-[var(--ds-green-700)]" />,
      })

      setOpen(false)
      setName("")
      setDescription("")
      setCategory("custom")
    } catch (error) {
      toast.error("Failed to save preset")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
            Save as Preset
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as Preset</DialogTitle>
          <DialogDescription>
            {selectedBlockIds.length > 0
              ? `Save ${selectedBlockIds.length} selected block(s) as a reusable preset`
              : `Save all ${blocks.length} block(s) as a reusable preset`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="My Custom Layout"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-description">Description (optional)</Label>
            <Textarea
              id="preset-description"
              placeholder="Describe what this preset contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as BlockPreset["category"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">My Presets</SelectItem>
                <SelectItem value="layout">Layout</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : "Save Preset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
