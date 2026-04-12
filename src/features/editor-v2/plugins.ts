import type { LucideIcon } from "lucide-react"
import type { BlockComponent, FieldDef } from "./registry"
import { registerBlock, hasBlock } from "./registry"
import { registerCommand, hasCommand } from "./commands"
import type { EditorCommand, CommandContext } from "./commands"

export interface PluginBlockDef {
  id: string
  component: BlockComponent
  fields: FieldDef[]
  defaultProps: Record<string, unknown>
  icon: LucideIcon
  category: string
}

export interface PluginCommandDef {
  id: string
  label: string
  icon: LucideIcon
  shortcut?: string
  group: EditorCommand["group"]
  requiresSelection?: boolean
  run: (ctx: CommandContext) => void
}

export interface PluginDefinition {
  id: string
  blocks?: PluginBlockDef[]
  commands?: PluginCommandDef[]
  panels?: { id: string; label: string }[]
}

const registeredPlugins = new Set<string>()

/** Register a plugin. Idempotent — safe to call twice with the same plugin ID. */
export function registerPlugin(plugin: PluginDefinition): void {
  if (registeredPlugins.has(plugin.id)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[editor-v2] Plugin "${plugin.id}" already registered, skipping.`)
    }
    return
  }

  registeredPlugins.add(plugin.id)

  if (plugin.blocks) {
    for (const block of plugin.blocks) {
      if (hasBlock(block.id)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[editor-v2] Plugin "${plugin.id}": block "${block.id}" already registered, skipping.`)
        }
        continue
      }
      registerBlock(block.id, {
        component: block.component,
        fields: block.fields,
        defaultProps: block.defaultProps,
        icon: block.icon,
        category: block.category,
      })
    }
  }

  if (plugin.commands) {
    for (const cmd of plugin.commands) {
      if (hasCommand(cmd.id)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[editor-v2] Plugin "${plugin.id}": command "${cmd.id}" already registered, skipping.`)
        }
        continue
      }
      registerCommand(cmd)
    }
  }
}
