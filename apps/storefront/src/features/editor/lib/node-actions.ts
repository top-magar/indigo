import type { useEditor } from "@craftjs/core"

type EditorActions = ReturnType<typeof useEditor>["actions"]
type EditorQuery = ReturnType<typeof useEditor>["query"]

export function moveNodeUp(actions: EditorActions, nodeId: string, parentId: string, index: number) {
  if (index > 0) actions.move(nodeId, parentId, index - 1)
}

export function moveNodeDown(actions: EditorActions, nodeId: string, parentId: string, index: number, siblingCount: number) {
  if (index < siblingCount - 1) actions.move(nodeId, parentId, index + 2)
}

export function duplicateNode(actions: EditorActions, query: EditorQuery, nodeId: string, parentId: string, index: number) {
  actions.addNodeTree(query.node(nodeId).toNodeTree(), parentId, index + 1)
}

export function deleteNode(actions: EditorActions, nodeId: string) {
  actions.delete(nodeId)
}

export function toggleHidden(actions: EditorActions, nodeId: string, currentlyHidden: boolean) {
  actions.setHidden(nodeId, !currentlyHidden)
}
