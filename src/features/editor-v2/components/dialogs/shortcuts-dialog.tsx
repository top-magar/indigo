"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { commands } from "../../commands"

// Extra shortcuts not in the command registry (contextual, not commands)
const EXTRA_SHORTCUTS = [
  ["⌘K", "Command Palette"],
  ["Alt+Arrow", "Nudge Padding"],
  ["Alt+⇧+Arrow", "Nudge ×10"],
  ["↑ / ↓", "Navigate Sections"],
  ["Space+Drag", "Pan Canvas"],
  ["⇧\\", "Toggle Panels"],
] as const

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const registered = commands.filter((c) => c.shortcut).map((c) => [c.shortcut!, c.label] as const)
  const all = [...registered, ...EXTRA_SHORTCUTS]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Keyboard Shortcuts</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {all.map(([key, desc]) => (
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
