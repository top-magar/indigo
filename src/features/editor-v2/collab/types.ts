/**
 * Collaboration Types — Abstract adapter interface.
 * The editor talks to the adapter, not to a specific sync protocol.
 * Swap LocalAdapter → YjsAdapter = instant collaboration, zero editor changes.
 */

import type { Document } from "../core/document"
import type { Operation } from "../core/operations"

export interface UserPresence {
  readonly userId: string
  readonly name: string
  readonly color: string
  readonly cursor: { nodeId: string; field?: string } | null
  readonly selection: readonly string[]
}

export interface CollabAdapter {
  /** Connect to the collaboration session */
  connect: (doc: Document) => void
  /** Disconnect from the session */
  disconnect: () => void
  /** Apply a local operation (sends to peers in multi-user mode) */
  applyOperation: (op: Operation) => Document
  /** Subscribe to remote operations from other users */
  onRemoteOperation: (handler: (op: Operation) => void) => () => void
  /** Get current awareness (cursors, selections, presence) */
  getAwareness: () => readonly UserPresence[]
  /** Update local user's cursor/selection */
  updatePresence: (presence: Partial<UserPresence>) => void
}
