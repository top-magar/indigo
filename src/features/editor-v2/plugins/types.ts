/**
 * Plugin System Types — The contract between plugins and the editor.
 * Third-party plugins get the same API as built-in ones.
 */

import type { BlockSchema, FieldMap } from "../core/schema"
import type { Document, DocumentNode } from "../core/document"
import type { Operation } from "../core/operations"

/** The constrained API surface exposed to plugins */
export interface EditorAPI {
  // Block registration
  registerBlock: <M extends FieldMap>(schema: BlockSchema<M>) => void
  unregisterBlock: (name: string) => void

  // Commands
  registerCommand: (cmd: EditorCommand) => void
  executeCommand: (id: string) => void

  // Document access
  getDocument: () => Document
  getSelectedNode: () => DocumentNode | null
  applyOperation: (op: Operation) => void

  // Events
  on: <K extends keyof EditorEvents>(event: K, handler: EditorEvents[K]) => () => void

  // UI
  select: (id: string | null) => void
}

export interface EditorCommand {
  readonly id: string
  readonly label: string
  readonly shortcut?: string
  readonly icon?: string
  readonly execute: () => void
}

export interface EditorEvents {
  "selection:change": (nodeId: string | null) => void
  "document:change": (doc: Document) => void
  "operation:applied": (op: Operation) => void
}

export interface EditorPlugin {
  readonly name: string
  readonly version: string
  init: (api: EditorAPI) => void
  destroy?: () => void
}
