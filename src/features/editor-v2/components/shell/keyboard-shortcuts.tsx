"use client"

import { useEffect } from "react"
import { useEditorStore } from "../../store"
import { matchKeyboardEvent, type CommandContext } from "../../commands"

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function KeyboardShortcuts({ onSave, onFind, onShortcuts }: { onSave: () => void; onFind: () => void; onShortcuts: () => void }) {
  const selectedId = useEditorStore(s => s.selectedId)

  useEffect(() => {
    const ctx: CommandContext = {
      onSave,
      onPublish: () => {},
      onTogglePreview: () => window.open("/editor-v2/preview", "_blank"),
      onFind,
      onShortcuts,
    }

    const handler = (e: KeyboardEvent) => {
      const inInput = INPUT_TAGS.has((e.target as HTMLElement).tagName)

      // Alt+Arrow: nudge padding (not a command — contextual to selection)
      if (e.altKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && !inInput && selectedId) {
        e.preventDefault()
        const delta = e.shiftKey ? 10 : 1
        const propMap: Record<string, string> = { ArrowUp: "_paddingTop", ArrowDown: "_paddingBottom", ArrowLeft: "_paddingLeft", ArrowRight: "_paddingRight" }
        const prop = propMap[e.key]
        const sec = useEditorStore.getState().sections.find((s) => s.id === selectedId)
        if (!sec || !prop) return
        const cur = (sec.props[prop] as number) ?? 0
        const sign = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1
        useEditorStore.getState().updateProps(selectedId, { [prop]: Math.max(0, cur + sign * delta) })
        return
      }

      // Arrow navigation between sections
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !inInput && selectedId) {
        e.preventDefault()
        const { sections, selectSection } = useEditorStore.getState()
        const idx = sections.findIndex((s) => s.id === selectedId)
        if (idx === -1) return
        const next = e.key === "ArrowUp" ? idx - 1 : idx + 1
        if (next >= 0 && next < sections.length) selectSection(sections[next].id)
        return
      }

      // Match against command registry
      const cmd = matchKeyboardEvent(e)
      if (!cmd) return
      if (cmd.requiresSelection && !useEditorStore.getState().selectedId) return
      e.preventDefault()
      cmd.run(ctx)
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, onSave, onFind, onShortcuts])

  return null
}
