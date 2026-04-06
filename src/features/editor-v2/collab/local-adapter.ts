/**
 * Local Adapter — Single-user collaboration adapter.
 * Operations applied directly to local document tree. No network.
 * Implements the same CollabAdapter interface that YjsAdapter will use.
 */

import type { CollabAdapter, UserPresence } from "./types"
import type { Document } from "../core/document"
import type { Operation } from "../core/operations"
import { applyOperation } from "../core/operations"

export function createLocalAdapter(): CollabAdapter {
  let doc: Document = { rootId: "", nodes: {} }
  const presence: UserPresence = { userId: "local", name: "You", color: "#005bd3", cursor: null, selection: [] }

  return {
    connect: (initial) => { doc = initial },
    disconnect: () => {},
    applyOperation: (op: Operation) => {
      doc = applyOperation(doc, op)
      return doc
    },
    onRemoteOperation: () => () => {},  // No remote ops in single-user
    getAwareness: () => [presence],
    updatePresence: (partial) => { Object.assign(presence, partial) },
  }
}
