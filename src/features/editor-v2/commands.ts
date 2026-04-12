import type { LucideIcon } from "lucide-react"
import { Save, Globe, Eye, Undo2, Redo2, Download, FileCode, Copy, Clipboard, Trash2, CopyPlus, Paintbrush, ClipboardPaste, Search, Keyboard, ZoomIn, ZoomOut, Maximize, MousePointer, Accessibility, ImageIcon } from "lucide-react"
import { useEditorStore } from "./store"

export interface EditorCommand {
  id: string
  label: string
  icon: LucideIcon
  /** Keyboard shortcut display string (e.g. "⌘S") */
  shortcut?: string
  /** Category for command palette grouping */
  group: "action" | "edit" | "view" | "zoom"
  /** Whether this command requires a selection */
  requiresSelection?: boolean
  run: (ctx: CommandContext) => void
}

export interface CommandContext {
  onSave: () => void
  onPublish: () => void
  onTogglePreview: () => void
  onFind: () => void
  onShortcuts: () => void
  onBrowseAssets?: () => void
}

/** Parse a shortcut string into a matcher. Handles ⌘, ⇧, ⌥, and key names. */
function parseShortcut(shortcut: string): { meta: boolean; shift: boolean; alt: boolean; key: string } | null {
  if (!shortcut) return null
  const meta = shortcut.includes("⌘")
  const shift = shortcut.includes("⇧")
  const alt = shortcut.includes("⌥")
  const key = shortcut.replace(/[⌘⇧⌥]/g, "").trim().toLowerCase()
  return { meta, shift, alt, key }
}

function matchesEvent(parsed: ReturnType<typeof parseShortcut>, e: KeyboardEvent): boolean {
  if (!parsed) return false
  const meta = e.metaKey || e.ctrlKey
  return meta === parsed.meta && e.shiftKey === parsed.shift && e.altKey === parsed.alt && e.key.toLowerCase() === parsed.key
}

const s = () => useEditorStore.getState()

export const commands: EditorCommand[] = [
  // ── Actions ──
  { id: "save", label: "Save", icon: Save, shortcut: "⌘s", group: "action", run: (ctx) => ctx.onSave() },
  { id: "publish", label: "Publish", icon: Globe, group: "action", run: (ctx) => ctx.onPublish() },
  { id: "preview", label: "Preview", icon: Eye, shortcut: "⌘p", group: "action", run: (ctx) => ctx.onTogglePreview() },
  { id: "find", label: "Find & Replace", icon: Search, shortcut: "⌘f", group: "action", run: (ctx) => ctx.onFind() },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard, shortcut: "⌘/", group: "action", run: (ctx) => ctx.onShortcuts() },
  { id: "browse-assets", label: "Browse Assets", icon: ImageIcon, group: "action", run: (ctx) => ctx.onBrowseAssets?.() },
  { id: "a11y-audit", label: "Accessibility Audit", icon: Accessibility, group: "action", run: () => {} },
  { id: "export-html", label: "Export as HTML", icon: FileCode, group: "action", run: () => { import("./components/dialogs/export-panel").then(m => m.exportAsHTML()) } },
  { id: "export-json", label: "Export as JSON", icon: Download, group: "action", run: () => { import("./components/dialogs/export-panel").then(m => m.exportAsJSON()) } },

  // ── Edit ──
  { id: "undo", label: "Undo", icon: Undo2, shortcut: "⌘z", group: "edit", run: () => useEditorStore.temporal.getState().undo() },
  { id: "redo", label: "Redo", icon: Redo2, shortcut: "⇧⌘z", group: "edit", run: () => useEditorStore.temporal.getState().redo() },
  { id: "select-all", label: "Select All", icon: MousePointer, shortcut: "⌘a", group: "edit", run: () => s().selectAll() },
  { id: "copy", label: "Copy Section", icon: Copy, shortcut: "⌘c", group: "edit", requiresSelection: true, run: () => { const id = s().selectedId; if (id) s().copySection(id) } },
  { id: "paste", label: "Paste Section", icon: Clipboard, shortcut: "⌘v", group: "edit", run: () => s().pasteSection() },
  { id: "duplicate", label: "Duplicate", icon: CopyPlus, shortcut: "⌘d", group: "edit", requiresSelection: true, run: () => { const id = s().selectedId; if (id) s().duplicateSection(id) } },
  { id: "delete", label: "Delete", icon: Trash2, shortcut: "Delete", group: "edit", requiresSelection: true, run: () => { for (const id of [...s().selectedIds]) s().removeSection(id) } },
  { id: "copy-style", label: "Copy Style", icon: Paintbrush, shortcut: "⌥⌘c", group: "edit", requiresSelection: true, run: () => s().copyStyle() },
  { id: "paste-style", label: "Paste Style", icon: ClipboardPaste, shortcut: "⌥⌘v", group: "edit", run: () => s().pasteStyle() },
  { id: "deselect", label: "Deselect", icon: MousePointer, shortcut: "Escape", group: "edit", run: () => s().selectSection(null) },

  // ── Zoom ──
  { id: "zoom-in", label: "Zoom In", icon: ZoomIn, shortcut: "⌘=", group: "zoom", run: () => s().setZoom(s().zoom + 10) },
  { id: "zoom-out", label: "Zoom Out", icon: ZoomOut, shortcut: "⌘-", group: "zoom", run: () => s().setZoom(s().zoom - 10) },
  { id: "zoom-reset", label: "Zoom to 100%", icon: Maximize, shortcut: "⌘0", group: "zoom", run: () => s().setZoom(100) },
]

/** Get a command by ID */
export function getCommand(id: string): EditorCommand | undefined {
  return commands.find((c) => c.id === id)
}

/** Check if a command ID is already registered */
export function hasCommand(id: string): boolean {
  return commands.some((c) => c.id === id)
}

/** Register a new command. Returns false if ID already exists. */
export function registerCommand(cmd: EditorCommand): boolean {
  if (hasCommand(cmd.id)) return false
  commands.push(cmd)
  rebuildShortcuts()
  return true
}

/** Run a command by ID */
export function runCommand(id: string, ctx: CommandContext): void {
  getCommand(id)?.run(ctx)
}

/** Pre-parsed shortcuts for fast keyboard matching */
let parsedShortcuts = buildShortcutCache()

function buildShortcutCache() {
  return commands
    .filter((c) => c.shortcut)
    .map((c) => ({ command: c, parsed: parseShortcut(c.shortcut!) }))
}

function rebuildShortcuts(): void {
  parsedShortcuts = buildShortcutCache()
}

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

/** Match a keyboard event to a command. Returns the command or undefined. */
export function matchKeyboardEvent(e: KeyboardEvent): EditorCommand | undefined {
  const inInput = INPUT_TAGS.has((e.target as HTMLElement).tagName)

  for (const { command, parsed } of parsedShortcuts) {
    if (!parsed) continue

    // Special handling: Delete/Backspace/Escape don't use meta
    if (parsed.key === "delete" && (e.key === "Delete" || e.key === "Backspace") && !inInput) return command
    if (parsed.key === "escape" && e.key === "Escape") return command

    // Skip text-editing shortcuts when in input
    if (inInput && !parsed.meta) continue
    if (inInput && ["a", "c", "v", "f", "d"].includes(parsed.key)) continue

    if (matchesEvent(parsed, e)) return command
  }
  return undefined
}
