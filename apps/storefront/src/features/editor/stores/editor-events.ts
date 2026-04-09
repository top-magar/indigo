/**
 * Typed event bus for cross-component communication.
 * Replaces prop-drilled callbacks (onAddSection, onZoomChange, etc.)
 * ~15 lines, zero dependencies.
 */

type EditorEvents = {
  "section:add": undefined
  "section:added": { nodeId: string }
  "page:switched": { pageId: string }
  "theme:changed": { key: string; value: unknown; prev: unknown }
  "save:completed": { timestamp: Date }
  "panel:toggle": { panel: "left" | "right"; tab?: string }
}

type Handler<T> = (data: T) => void

const listeners = new Map<string, Set<Handler<unknown>>>()

export function editorOn<K extends keyof EditorEvents>(event: K, handler: Handler<EditorEvents[K]>): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  const set = listeners.get(event)!
  set.add(handler as Handler<unknown>)
  return () => set.delete(handler as Handler<unknown>)
}

export function editorEmit<K extends keyof EditorEvents>(event: K, ...args: EditorEvents[K] extends undefined ? [] : [EditorEvents[K]]): void {
  const set = listeners.get(event)
  if (!set) return
  const data = args[0] as EditorEvents[K]
  set.forEach((h) => h(data))
}

export function editorOff<K extends keyof EditorEvents>(event: K, handler: Handler<EditorEvents[K]>): void {
  listeners.get(event)?.delete(handler as Handler<unknown>)
}

/** Safety net — clear all listeners on editor unmount */
export function editorClearAll(): void {
  listeners.clear()
}
