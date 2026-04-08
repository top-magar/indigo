/** Scroll the canvas to make a newly added block visible */
export function scrollToNode(nodeId: string, delay = 50): void {
  setTimeout(() => {
    const el = document.querySelector(`[data-craft-node-id="${nodeId}"]`) as HTMLElement | null
    const canvas = document.querySelector("[data-editor-canvas]") as HTMLElement | null
    if (!el || !canvas) return
    el.scrollIntoView({ behavior: "smooth", block: "center" })
  }, delay)
}

/** Scroll to the last child of a parent node */
export function scrollToLastChild(parentId: string, delay = 100): void {
  setTimeout(() => {
    const parent = document.querySelector(`[data-craft-node-id="${parentId}"]`) as HTMLElement | null
    if (!parent) return
    const children = parent.querySelectorAll(":scope > [data-craft-node-id]")
    const last = children[children.length - 1] as HTMLElement | null
    last?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, delay)
}
