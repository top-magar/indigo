"use client"
import { useMemo } from "react"
import { LayoutTemplate, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { blockTemplates } from "../../templates"
import { getStyleDeclKey } from "../../types"
import { generateId } from "../../id"

export function TemplatesPanel() {
  const s = useStore()

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof blockTemplates>()
    for (const t of blockTemplates) {
      const list = groups.get(t.category) ?? []
      list.push(t)
      groups.set(t.category, list)
    }
    return groups
  }, [])

  const handleInsert = (templateId: string) => {
    const tmpl = blockTemplates.find((t) => t.id === templateId)
    if (!tmpl) return
    const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
    const parentId = s.selectedInstanceId ?? page?.rootInstanceId
    if (!parentId) return
    const parent = s.instances.get(parentId)
    if (!parent) return
    const result = tmpl.build()
    useEditorV3Store.setState((draft) => {
      for (const inst of result.instances) draft.instances.set(inst.id, inst)
      for (const prop of result.props) draft.props.set(prop.id, prop)
      for (const ss of result.styleSources) draft.styleSources.set(ss.id, ss)
      for (const sel of result.styleSourceSelections) draft.styleSourceSelections.set(sel.instanceId, sel)
      for (const decl of result.styleDeclarations) draft.styleDeclarations.set(getStyleDeclKey(decl), decl)
      const p = draft.instances.get(parentId)
      if (p) p.children.push({ type: "id", value: result.rootId })
      draft.selectedInstanceId = result.rootId
    })
  }

  return (
    <div className="p-2 overflow-y-auto">
      {/* User saved components */}
      {s.userComponents.size > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-1 font-medium">My Components</div>
          <div className="flex flex-col gap-1">
            {[...s.userComponents.values()].map((uc) => (
              <div key={uc.id} className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md border border-transparent hover:border-border hover:bg-accent/50 transition-colors group">
                <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5 text-primary" />
                </div>
                <button className="flex-1 text-left min-w-0" onClick={() => {
                  try {
                    const snap = JSON.parse(uc.snapshot)
                    const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
                    const parentId = s.selectedInstanceId ?? page?.rootInstanceId
                    if (!parentId) return
                    // Remap all IDs to new ones
                    const idMap = new Map<string, string>()
                    for (const [oldId] of snap.instances) idMap.set(oldId, generateId())
                    const ssIdMap = new Map<string, string>()
                    for (const [oldId] of snap.styleSources) ssIdMap.set(oldId, generateId())

                    useEditorV3Store.setState((draft) => {
                      for (const [oldId, inst] of snap.instances) {
                        const newId = idMap.get(oldId)!
                        const i = inst as { id: string; component: string; tag?: string; label?: string; children: Array<{ type: string; value: string }> }
                        draft.instances.set(newId, { ...i, id: newId, children: i.children.map((c: { type: string; value: string }) => c.type === "id" ? { type: "id" as const, value: idMap.get(c.value) ?? c.value } : { type: c.type as "text" | "expression", value: c.value }) })
                      }
                      for (const [, prop] of snap.props) {
                        const p = prop as { id: string; instanceId: string }
                        const newInstId = idMap.get(p.instanceId)
                        if (newInstId) draft.props.set(generateId(), { ...p, id: generateId(), instanceId: newInstId } as never)
                      }
                      for (const [oldSsId, ss] of snap.styleSources) {
                        const newSsId = ssIdMap.get(oldSsId)!
                        draft.styleSources.set(newSsId, { ...(ss as object), id: newSsId } as never)
                      }
                      for (const [oldInstId, sel] of snap.styleSourceSelections) {
                        const newInstId = idMap.get(oldInstId)!
                        const s2 = sel as { values: string[] }
                        draft.styleSourceSelections.set(newInstId, { instanceId: newInstId, values: s2.values.map((v) => ssIdMap.get(v) ?? v) })
                      }
                      for (const [, decl] of snap.styleDeclarations) {
                        const d = decl as { styleSourceId: string; breakpointId: string; property: string; state?: string }
                        const newSsId = ssIdMap.get(d.styleSourceId) ?? d.styleSourceId
                        const key = `${newSsId}:${d.breakpointId}:${d.property}:${d.state ?? ""}`
                        draft.styleDeclarations.set(key, { ...d, styleSourceId: newSsId } as never)
                      }
                      const p = draft.instances.get(parentId)
                      if (p) p.children.push({ type: "id", value: idMap.get(snap.rootId)! })
                      draft.selectedInstanceId = idMap.get(snap.rootId) ?? null
                    })
                  } catch { /* ignore parse errors */ }
                }}>
                  <div className="text-[11px] font-medium truncate">{uc.name}</div>
                </button>
                <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={() => useEditorV3Store.getState().removeUserComponent(uc.id)}>
                  <Trash2 className="size-2.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Built-in templates */}
      {[...grouped].map(([category, templates]) => (
        <div key={category} className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 px-1 font-medium">{category}</div>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <button key={t.id} onClick={() => handleInsert(t.id)}
                className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-md text-left border border-transparent hover:border-border hover:bg-accent/50 transition-colors group">
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <LayoutTemplate className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-foreground truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
