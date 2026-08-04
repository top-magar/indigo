"use client"

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { componentGroups } from "../core/registry"
import { useInsertElement } from "../core/use-insert-element"
import { useEditor } from "../core/provider"
import type { Device } from "../core/types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPreview: () => void
  onPublish: () => void
  onSave: () => void
  onOpenLibrary: () => void
}

export function EditorCommandPalette({ open, onOpenChange, onPreview, onPublish, onSave, onOpenLibrary }: Props) {
  const { dispatch } = useEditor()
  const insert = useInsertElement()
  const run = (action: () => void) => {
    action()
    onOpenChange(false)
  }
  const setDevice = (device: Device) => run(() => dispatch({ type: "CHANGE_DEVICE", payload: { device } }))
  const quickItems = componentGroups().flatMap((group) => group.items).slice(0, 24)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Editor commands" description="Search pages, sections, viewports, and publishing actions.">
      <CommandInput placeholder="Search editor actions" />
      <CommandList>
        <CommandEmpty>No matching editor action.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onOpenLibrary)}>Add section<CommandShortcut>A</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(onSave)}>Save changes<CommandShortcut>⌘S</CommandShortcut></CommandItem>
          <CommandItem onSelect={() => run(onPreview)}>Preview store</CommandItem>
          <CommandItem onSelect={() => run(onPublish)}>Validate and publish</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Viewport">
          <CommandItem onSelect={() => setDevice("desktop")}>Desktop viewport</CommandItem>
          <CommandItem onSelect={() => setDevice("tablet")}>Tablet viewport</CommandItem>
          <CommandItem onSelect={() => setDevice("mobile")}>Mobile viewport</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Insert">
          {quickItems.map((item) => <CommandItem key={item.type} onSelect={() => run(() => void insert(item.type))}>{item.label}</CommandItem>)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
