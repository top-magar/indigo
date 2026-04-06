import type { EditorPlugin } from "../types"
import { getCommands } from "../loader"

export const shortcutsPlugin: EditorPlugin = {
  name: "shortcuts",
  version: "1.0.0",
  init(api) {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return

      // Copy
      if (meta && e.key === "c") { e.preventDefault(); api.executeCommand("clipboard:copy") }
      // Paste
      if (meta && e.key === "v") { e.preventDefault(); api.executeCommand("clipboard:paste") }
      // Duplicate
      if (meta && e.key === "d") { e.preventDefault(); api.executeCommand("clipboard:duplicate") }
    }

    window.addEventListener("keydown", handler)
    // Store teardown for unload — accessed via plugin loader internals
    ;(this as { _teardown?: () => void })._teardown = () => window.removeEventListener("keydown", handler)
  },
  destroy() {
    ;(this as { _teardown?: () => void })._teardown?.()
  },
}
