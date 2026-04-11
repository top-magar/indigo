"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const SHORTCUTS = [
  ["⌘Z", "Undo"], ["⌘⇧Z", "Redo"], ["⌘S", "Save"], ["⌘K", "Command Palette"],
  ["⌘D", "Duplicate"], ["⌘A", "Select All"], ["Delete", "Remove"], ["⌘C / ⌘V", "Copy / Paste"],
  ["⌘⌥C", "Copy Style"], ["⌘⌥V", "Paste Style"], ["Alt+Arrow", "Nudge"], ["Alt+⇧+Arrow", "Nudge 10"],
  ["⌘F", "Find & Replace"], ["⌘?", "Shortcuts"], ["Space+Drag", "Pan"], ["⇧\\", "Toggle Panels"],
  ["⌘+", "Zoom In"], ["⌘-", "Zoom Out"], ["⌘0", "Reset Zoom"], ["Esc", "Deselect"],
] as const

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Keyboard Shortcuts</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between gap-2 py-0.5">
              <span className="text-muted-foreground text-xs">{desc}</span>
              <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
