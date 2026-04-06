export { loadPlugin, unloadPlugin, getCommands, getLoadedPlugins } from "./loader"
export type { EditorPlugin, EditorAPI, EditorCommand } from "./types"

import { loadPlugin } from "./loader"
import { clipboardPlugin } from "./built-in/clipboard"
import { shortcutsPlugin } from "./built-in/shortcuts"

/** Load all built-in plugins. Call once at editor init. */
export function loadBuiltInPlugins(): void {
  loadPlugin(clipboardPlugin)
  loadPlugin(shortcutsPlugin)
}
