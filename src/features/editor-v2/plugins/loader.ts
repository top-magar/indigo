/**
 * Plugin Loader — Manages plugin lifecycle and provides the EditorAPI.
 * Tracks what each plugin registered so unload is clean.
 */

import type { EditorPlugin, EditorAPI, EditorCommand, EditorEvents } from "./types"
import type { BlockSchema, FieldMap } from "../core/schema"
import type { Operation } from "../core/operations"
import { registerBlock, unregisterBlock } from "../core/registry"
import { getNode } from "../core/document"
import { useEditorStore } from "../editor/store"

// ─── Internal State ──────────────────────────────────────────

const loadedPlugins = new Map<string, { plugin: EditorPlugin; blocks: string[]; commands: string[]; teardowns: Array<() => void> }>()
const commands = new Map<string, EditorCommand>()
const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

// ─── Event Bus ───────────────────────────────────────────────

function emit<K extends keyof EditorEvents>(event: K, ...args: Parameters<EditorEvents[K]>): void {
  const set = listeners.get(event)
  if (set) for (const fn of set) fn(...args)
}

function on<K extends keyof EditorEvents>(event: K, handler: EditorEvents[K]): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  const set = listeners.get(event)!
  set.add(handler as (...args: unknown[]) => void)
  return () => set.delete(handler as (...args: unknown[]) => void)
}

// ─── EditorAPI Factory ───────────────────────────────────────

function createAPI(pluginName: string): EditorAPI {
  const tracking = loadedPlugins.get(pluginName)!

  return {
    registerBlock: <M extends FieldMap>(schema: BlockSchema<M>) => {
      registerBlock(schema)
      tracking.blocks.push(schema.name)
    },
    unregisterBlock: (name: string) => {
      unregisterBlock(name)
      tracking.blocks = tracking.blocks.filter((b) => b !== name)
    },
    registerCommand: (cmd: EditorCommand) => {
      commands.set(cmd.id, cmd)
      tracking.commands.push(cmd.id)
    },
    executeCommand: (id: string) => {
      const cmd = commands.get(id)
      if (cmd) cmd.execute()
    },
    getDocument: () => useEditorStore.getState().document,
    getSelectedNode: () => {
      const { document: doc, selectedId } = useEditorStore.getState()
      return selectedId ? getNode(doc, selectedId) : null
    },
    applyOperation: (op: Operation) => {
      useEditorStore.getState().apply(op)
      emit("operation:applied", op)
    },
    on,
    select: (id) => useEditorStore.getState().select(id),
  }
}

// ─── Public API ──────────────────────────────────────────────

export function loadPlugin(plugin: EditorPlugin): void {
  if (loadedPlugins.has(plugin.name)) return // Already loaded — skip silently
  loadedPlugins.set(plugin.name, { plugin, blocks: [], commands: [], teardowns: [] })
  plugin.init(createAPI(plugin.name))
}

export function unloadPlugin(name: string): void {
  const entry = loadedPlugins.get(name)
  if (!entry) return
  // Clean up registered blocks
  for (const blockName of entry.blocks) unregisterBlock(blockName)
  // Clean up registered commands
  for (const cmdId of entry.commands) commands.delete(cmdId)
  // Call teardowns
  for (const fn of entry.teardowns) fn()
  // Call plugin destroy
  entry.plugin.destroy?.()
  loadedPlugins.delete(name)
}

export function getCommands(): EditorCommand[] {
  return Array.from(commands.values())
}

export function getLoadedPlugins(): string[] {
  return Array.from(loadedPlugins.keys())
}

/** Emit document change event — called by store subscriber */
export { emit }
