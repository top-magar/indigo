import type { CanvasAdapter } from "./canvas-adapter"

export function scrollToNode(adapter: CanvasAdapter, nodeId: string, delay = 50): void {
  setTimeout(() => { adapter.getNodeElement(nodeId)?.scrollIntoView({ behavior: "smooth", block: "center" }) }, delay)
}

export function scrollToLastChild(adapter: CanvasAdapter, parentId: string, delay = 100): void {
  setTimeout(() => {
    const parent = adapter.getNodeElement(parentId)
    if (!parent) return
    const children = parent.querySelectorAll(":scope > [data-craft-node-id]")
    ;(children[children.length - 1] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, delay)
}
