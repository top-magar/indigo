"use client"
import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { Square, Type, Heading1, ImageIcon, Link2, MousePointerClick, FileInput, TextCursorInput, Code2, BoxSelect, Rows3, Undo2, Redo2, Eye, Download, Trash2, Copy, Layers } from "lucide-react"
import { useEditorV3Store } from "../../stores/store"
import { getAllMetas } from "../../registry/registry"
import { publishFromStore } from "../../publish"

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const addComponent = (name: string) => {
    const s = useEditorV3Store.getState()
    const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
    const parentId = s.selectedInstanceId ?? page?.rootInstanceId
    if (!parentId) return
    const parent = s.instances.get(parentId)
    if (!parent) return
    const id = s.addInstance(parentId, parent.children.length, name)
    s.select(id)
    setOpen(false)
  }

  const icons: Record<string, typeof Square> = {
    Box: Square, Text: Type, Heading: Heading1, Image: ImageIcon, Link: Link2,
    Button: MousePointerClick, Form: FileInput, Input: TextCursorInput,
    CodeBlock: Code2, Container: BoxSelect, Section: Rows3, Slot: Layers,
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { useEditorV3Store.temporal.getState().undo(); setOpen(false) }}>
            <Undo2 className="size-4" /> Undo <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { useEditorV3Store.temporal.getState().redo(); setOpen(false) }}>
            <Redo2 className="size-4" /> Redo <CommandShortcut>⌘⇧Z</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => {
            const html = publishFromStore(useEditorV3Store.getState())
            if (!html) return
            const win = window.open("", "_blank")
            if (win) { win.document.write(html); win.document.close() }
            setOpen(false)
          }}>
            <Eye className="size-4" /> Preview <CommandShortcut>Preview</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => {
            const html = publishFromStore(useEditorV3Store.getState())
            if (!html) return
            const blob = new Blob([html], { type: "text/html" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a"); a.href = url; a.download = "page.html"; a.click()
            URL.revokeObjectURL(url)
            setOpen(false)
          }}>
            <Download className="size-4" /> Export HTML
          </CommandItem>
          {useEditorV3Store.getState().selectedInstanceId && (
            <>
              <CommandItem onSelect={() => {
                const s = useEditorV3Store.getState()
                if (s.selectedInstanceId) { s.removeInstance(s.selectedInstanceId); s.select(null) }
                setOpen(false)
              }}>
                <Trash2 className="size-4" /> Delete selected <CommandShortcut>⌫</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => {
                const s = useEditorV3Store.getState()
                if (s.selectedInstanceId) navigator.clipboard.writeText(s.selectedInstanceId)
                setOpen(false)
              }}>
                <Copy className="size-4" /> Copy element ID
              </CommandItem>
            </>
          )}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Add Element">
          {[...getAllMetas()].map(([name, meta]) => {
            const Icon = icons[name] ?? Square
            return (
              <CommandItem key={name} onSelect={() => addComponent(name)}>
                <Icon className="size-4" /> {meta.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
