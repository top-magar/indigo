"use client"
import { useMemo } from "react"
import { LayoutTemplate } from "lucide-react"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { blockTemplates } from "../../templates"
import { getStyleDeclKey } from "../../types"

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
      {[...grouped].map(([category, templates]) => (
        <div key={category} className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 px-1 font-medium">{category}</div>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <button key={t.id} onClick={() => handleInsert(t.id)}
                className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-md text-left border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors group">
                <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <LayoutTemplate className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-gray-700 truncate">{t.name}</div>
                  <div className="text-[10px] text-gray-400 leading-tight">{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
