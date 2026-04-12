"use client"

import { useMemo } from "react"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { useEditorStore } from "../../store"
import { getAllBlocks } from "../../registry"
import { commands, type CommandContext } from "../../commands"

interface Props {
  open: boolean
  onClose: () => void
  onSave: () => void
  onPublish: () => void
  onTogglePreview: () => void
  onBrowseAssets?: () => void
}

export function CommandPalette({ open, onClose, onSave, onPublish, onTogglePreview, onBrowseAssets }: Props) {
  const addSection = useEditorStore((s) => s.addSection)
  const blocks = useMemo(() => [...getAllBlocks().entries()], [])

  const ctx: CommandContext = { onSave, onPublish, onTogglePreview, onFind: () => {}, onShortcuts: () => {}, onBrowseAssets }

  const run = (fn: () => void) => { fn(); onClose() }

  const grouped = useMemo(() => {
    const groups: Record<string, typeof commands> = {}
    for (const cmd of commands) {
      if (cmd.id === "deselect") continue // not useful in palette
      ;(groups[cmd.group] ??= []).push(cmd)
    }
    return groups
  }, [])

  const groupLabels: Record<string, string> = { action: "Actions", edit: "Edit", view: "View", zoom: "Zoom" }

  return (
    <CommandDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {Object.entries(grouped).map(([group, cmds]) => (
          <CommandGroup key={group} heading={groupLabels[group] ?? group}>
            {cmds.map((cmd) => {
              const Icon = cmd.icon
              return (
                <CommandItem key={cmd.id} onSelect={() => run(() => cmd.run(ctx))}>
                  <Icon className="size-4 mr-2" />{cmd.label}
                  {cmd.shortcut && <CommandShortcut>{cmd.shortcut.replace(/⌘/g, "⌘").replace(/⇧/g, "⇧").replace(/⌥/g, "⌥")}</CommandShortcut>}
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
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
