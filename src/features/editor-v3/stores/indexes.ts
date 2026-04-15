import type { InstanceId, Prop, StyleDeclaration, StyleValue } from "../types"
import { useEditorV3Store, type EditorV3Store } from "./store"

// ── Memoization layer ──────────────────────────────────────────────────────────
// Each index caches its result and the source Maps it was built from.
// Only rebuilds when the source reference changes (immer produces new refs on mutation).

let _parentCache: { src: Map<InstanceId, unknown>; result: Map<InstanceId, InstanceId> } | null = null
let _propsCache: { src: Map<string, Prop>; result: Map<InstanceId, Prop[]> } | null = null
let _styleDeclCache: { src: Map<string, StyleDeclaration>; result: Map<string, StyleDeclaration[]> } | null = null

/** childId → parentId */
export function buildParentIndex(state: EditorV3Store): Map<InstanceId, InstanceId> {
  if (_parentCache && _parentCache.src === state.instances) return _parentCache.result

  const index = new Map<InstanceId, InstanceId>()
  for (const [parentId, inst] of state.instances) {
    for (const child of inst.children) {
      if (child.type === "id") index.set(child.value, parentId)
    }
  }
  _parentCache = { src: state.instances as Map<InstanceId, unknown>, result: index }
  return index
}

/** instanceId → Prop[] */
export function buildPropsIndex(state: EditorV3Store): Map<InstanceId, Prop[]> {
  if (_propsCache && _propsCache.src === state.props) return _propsCache.result

  const index = new Map<InstanceId, Prop[]>()
  for (const prop of state.props.values()) {
    const list = index.get(prop.instanceId)
    if (list) list.push(prop)
    else index.set(prop.instanceId, [prop])
  }
  _propsCache = { src: state.props, result: index }
  return index
}

/** styleSourceId → StyleDeclaration[] (pre-grouped for O(1) lookup) */
export function buildStyleDeclIndex(state: EditorV3Store): Map<string, StyleDeclaration[]> {
  if (_styleDeclCache && _styleDeclCache.src === state.styleDeclarations) return _styleDeclCache.result

  const index = new Map<string, StyleDeclaration[]>()
  for (const decl of state.styleDeclarations.values()) {
    const list = index.get(decl.styleSourceId)
    if (list) list.push(decl)
    else index.set(decl.styleSourceId, [decl])
  }
  _styleDeclCache = { src: state.styleDeclarations, result: index }
  return index
}

/** instanceId → Record<property, StyleValue> (resolved for a given breakpoint, cascaded) */
export function buildResolvedStyles(state: EditorV3Store, breakpointId: string): Map<InstanceId, Record<string, StyleValue>> {
  const index = new Map<InstanceId, Record<string, StyleValue>>()

  // Sort breakpoints: base first (no minWidth), then ascending minWidth
  const sortedBps = [...state.breakpoints.values()].sort((a, b) => (a.minWidth ?? -1) - (b.minWidth ?? -1))
  const activeBpIds = new Set<string>()
  for (const bp of sortedBps) {
    activeBpIds.add(bp.id)
    if (bp.id === breakpointId) break
  }

  // Use memoized decl index
  const declIndex = buildStyleDeclIndex(state)

  for (const [instanceId, selection] of state.styleSourceSelections) {
    const resolved: Record<string, StyleValue> = {}

    for (const ssId of selection.values) {
      const decls = declIndex.get(ssId)
      if (!decls) continue
      for (const decl of decls) {
        if (activeBpIds.has(decl.breakpointId) && !decl.state) {
          resolved[decl.property] = decl.value
        }
      }
    }

    if (Object.keys(resolved).length > 0) index.set(instanceId, resolved)
  }

  return index
}

// ── React hooks for derived data ───────────────────────────────────────────────

export function useParentIndex(): Map<InstanceId, InstanceId> {
  return useEditorV3Store(buildParentIndex)
}

export function usePropsIndex(): Map<InstanceId, Prop[]> {
  return useEditorV3Store(buildPropsIndex)
}

export function useResolvedStyles(breakpointId: string): Map<InstanceId, Record<string, StyleValue>> {
  return useEditorV3Store((s) => buildResolvedStyles(s, breakpointId))
}
