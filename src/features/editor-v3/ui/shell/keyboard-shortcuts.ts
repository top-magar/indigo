"use client"
import { useEffect } from "react"
import { useEditorV3Store } from "../../stores/store"
import { buildParentIndex } from "../../stores/indexes"
import { generateId } from "../../id"
import type { InstanceId } from "../../types"

let clipboard: InstanceId | null = null
/** Stores copied style declarations for paste-styles */
let styleClipboard: Array<{ breakpointId: string; property: string; value: unknown; state?: string }> = []

export function copyStyles(instanceId: InstanceId): void {
  const s = useEditorV3Store.getState()
  const sel = s.styleSourceSelections.get(instanceId)
  if (!sel) return
  styleClipboard = []
  for (const decl of s.styleDeclarations.values()) {
    if (sel.values.includes(decl.styleSourceId)) {
      styleClipboard.push({ breakpointId: decl.breakpointId, property: decl.property, value: decl.value, state: decl.state })
    }
  }
}

export function pasteStyles(instanceId: InstanceId): void {
  if (styleClipboard.length === 0) return
  const s = useEditorV3Store.getState()
  let sel = s.styleSourceSelections.get(instanceId)
  if (!sel || sel.values.length === 0) {
    // Create a style source for this instance
    const ssId = generateId()
    useEditorV3Store.setState((draft) => {
      draft.styleSources.set(ssId, { id: ssId, type: "local" })
      draft.styleSourceSelections.set(instanceId, { instanceId, values: [ssId] })
    })
    sel = { instanceId, values: [ssId] }
  }
  const ssId = sel.values[0]
  for (const decl of styleClipboard) {
    s.setStyleDeclaration(ssId, decl.breakpointId, decl.property, decl.value as never, decl.state)
  }
}

function deepCloneInstance(sourceId: InstanceId): void {
  const s = useEditorV3Store.getState()
  const source = s.instances.get(sourceId)
  if (!source) return

  const parentIndex = buildParentIndex(s)
  const parentId = parentIndex.get(sourceId)
  if (!parentId) return
  const parent = s.instances.get(parentId)
  if (!parent) return
  const idx = parent.children.findIndex((c) => c.type === "id" && c.value === sourceId)

  // Collect all instances in subtree, map old→new IDs
  const idMap = new Map<InstanceId, InstanceId>()
  const collect = (id: InstanceId) => {
    idMap.set(id, generateId())
    const inst = s.instances.get(id)
    if (!inst) return
    for (const c of inst.children) { if (c.type === "id") collect(c.value) }
  }
  collect(sourceId)

  // Clone instances with remapped IDs
  useEditorV3Store.setState((draft) => {
    for (const [oldId, newId] of idMap) {
      const orig = draft.instances.get(oldId)
      if (!orig) continue
      draft.instances.set(newId, {
        id: newId, component: orig.component, tag: orig.tag,
        label: orig.label ? `${orig.label} copy` : undefined,
        children: orig.children.map((c) => c.type === "id" ? { type: "id" as const, value: idMap.get(c.value) ?? c.value } : { ...c }),
      })
    }
    // Insert clone as sibling
    const p = draft.instances.get(parentId)
    if (p) p.children.splice(idx + 1, 0, { type: "id", value: idMap.get(sourceId)! })

    // Clone props
    for (const prop of draft.props.values()) {
      const newInstId = idMap.get(prop.instanceId)
      if (newInstId) {
        const newProp = { ...prop, id: generateId(), instanceId: newInstId }
        draft.props.set(newProp.id, newProp as typeof prop)
      }
    }

    // Clone style source selections + declarations
    for (const [oldId, newId] of idMap) {
      const sel = draft.styleSourceSelections.get(oldId)
      if (!sel) continue
      const newSsIds: string[] = []
      for (const ssId of sel.values) {
        const newSsId = generateId()
        newSsIds.push(newSsId)
        const ss = draft.styleSources.get(ssId)
        if (ss) draft.styleSources.set(newSsId, { ...ss, id: newSsId })
        for (const decl of draft.styleDeclarations.values()) {
          if (decl.styleSourceId === ssId) {
            const key = `${newSsId}:${decl.breakpointId}:${decl.property}:${decl.state ?? ""}`
            draft.styleDeclarations.set(key, { ...decl, styleSourceId: newSsId })
          }
        }
      }
      draft.styleSourceSelections.set(newId, { instanceId: newId, values: newSsIds })
    }
  })

  s.select(idMap.get(sourceId) ?? null)
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return

      const state = useEditorV3Store.getState()

      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); useEditorV3Store.temporal.getState().undo(); return }
      if (mod && e.key === "z" && e.shiftKey) { e.preventDefault(); useEditorV3Store.temporal.getState().redo(); return }

      if (mod && e.key === "c" && state.selectedInstanceId) { e.preventDefault(); clipboard = state.selectedInstanceId; return }
      if (mod && e.key === "v" && clipboard) { e.preventDefault(); deepCloneInstance(clipboard); return }

      if ((e.key === "Backspace" || e.key === "Delete") && state.selectedInstanceId) {
        e.preventDefault()
        const parentIndex = buildParentIndex(state)
        if (state.selectedInstanceIds.size > 1) {
          // Bulk delete
          for (const id of state.selectedInstanceIds) {
            if (parentIndex.has(id)) state.removeInstance(id)
          }
          state.select(null)
        } else {
          const id = state.selectedInstanceId
          if (!parentIndex.has(id)) return
          const parentId = parentIndex.get(id)
          state.removeInstance(id)
          state.select(parentId ?? null)
        }
        return
      }

      if (e.key === "Escape") { state.select(null); return }

      if (mod && e.key === "d" && state.selectedInstanceId) {
        e.preventDefault()
        clipboard = state.selectedInstanceId
        deepCloneInstance(state.selectedInstanceId)
        return
      }

      // Alt+C = copy styles, Alt+V = paste styles
      if (e.altKey && e.key === "c" && state.selectedInstanceId) {
        e.preventDefault(); copyStyles(state.selectedInstanceId); return
      }
      if (e.altKey && e.key === "v" && state.selectedInstanceId) {
        e.preventDefault(); pasteStyles(state.selectedInstanceId); return
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}
