"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { KeyboardIcon } from "@hugeicons/core-free-icons"

const SHORTCUTS = [
  { category: "General", items: [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["⌘", "S"], description: "Save draft" },
    { keys: ["Esc"], description: "Deselect / Clear selection" },
    { keys: ["⌘", "A"], description: "Select all blocks" },
  ]},
  { category: "Selection", items: [
    { keys: ["Click"], description: "Select block" },
    { keys: ["⇧", "Click"], description: "Add to selection" },
    { keys: ["⌘", "Click"], description: "Toggle in selection" },
  ]},
  { category: "Editing", items: [
    { keys: ["⌘", "C"], description: "Copy selected block" },
    { keys: ["⌘", "V"], description: "Paste block" },
    { keys: ["⌘", "D"], description: "Duplicate selected block(s)" },
    { keys: ["⌘", "H"], description: "Toggle block visibility" },
    { keys: ["⌫"], description: "Delete selected block(s)" },
    { keys: ["⌥", "↑"], description: "Move selected block(s) up" },
    { keys: ["⌥", "↓"], description: "Move selected block(s) down" },
  ]},
  { category: "View", items: [
    { keys: ["1"], description: "Desktop view" },
    { keys: ["2"], description: "Tablet view" },
    { keys: ["3"], description: "Mobile view" },
    { keys: ["⌘", "G"], description: "Toggle snapping/guides" },
    { keys: ["Alt"], description: "Hold to disable snapping" },
  ]},
  { category: "History", items: [
    { keys: ["⌘", "Z"], description: "Undo" },
    { keys: ["⌘", "⇧", "Z"], description: "Redo" },
  ]},
]

interface KeyboardShortcutsDialogProps {
  trigger?: React.ReactNode
  iconOnly?: boolean
}

export function KeyboardShortcutsDialog({ trigger, iconOnly }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          iconOnly ? (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HugeiconsIcon icon={KeyboardIcon} className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
              <HugeiconsIcon icon={KeyboardIcon} className="h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {SHORTCUTS.map((section) => (
            <div key={section.category}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-xs font-medium"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
