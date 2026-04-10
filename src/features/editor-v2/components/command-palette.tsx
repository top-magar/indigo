"use client"

import { useMemo } from "react"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { useEditorStore } from "../store"
import { getAllBlocks } from "../registry"
import { Save, Globe, Eye, Undo2, Redo2, Download, FileCode } from "lucide-react"
import { exportAsHTML, exportAsJSON } from "./export-panel"

interface Props {
  open: boolean
  onClose: () => void
  onSave: () => void
  onPublish: () => void
  onTogglePreview: () => void
}

export function CommandPalette({ open, onClose, onSave, onPublish, onTogglePreview }: Props) {
  const addSection = useEditorStore((s) => s.addSection)
  const blocks = useMemo(() => [...getAllBlocks().entries()], [])

  const run = (fn: () => void) => { fn(); onClose() }

  return (
    <CommandDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onSave)}><Save className="size-4 mr-2" />Save<CommandShortcut>⌘S</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(onPublish)}><Globe className="size-4 mr-2" />Publish</CommandItem>
          <CommandItem onSelect={() => run(onTogglePreview)}><Eye className="size-4 mr-2" />Toggle Preview<CommandShortcut>⌘P</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(() => useEditorStore.temporal.getState().undo())}><Undo2 className="size-4 mr-2" />Undo<CommandShortcut>⌘Z</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(() => useEditorStore.temporal.getState().redo())}><Redo2 className="size-4 mr-2" />Redo<CommandShortcut>⇧⌘Z</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(exportAsHTML)}><FileCode className="size-4 mr-2" />Export as HTML</CommandItem>
          <CommandItem onSelect={() => run(exportAsJSON)}><Download className="size-4 mr-2" />Export as JSON</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Add Section">
          {blocks.map(([name, reg]) => {
            const Icon = reg.icon
            return (
              <CommandItem key={name} onSelect={() => run(() => addSection(name))}>
                <Icon className="size-4 mr-2" />{name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
