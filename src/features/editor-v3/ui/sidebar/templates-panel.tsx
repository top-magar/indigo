"use client"
import { useMemo } from "react"
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

    // Insert all data into the store
    useEditorV3Store.setState((draft) => {
      for (const inst of result.instances) draft.instances.set(inst.id, inst)
      for (const prop of result.props) draft.props.set(prop.id, prop)
      for (const ss of result.styleSources) draft.styleSources.set(ss.id, ss)
      for (const sel of result.styleSourceSelections) draft.styleSourceSelections.set(sel.instanceId, sel)
      for (const decl of result.styleDeclarations) draft.styleDeclarations.set(getStyleDeclKey(decl), decl)

      // Add root of template as child of parent
      const p = draft.instances.get(parentId)
      if (p) p.children.push({ type: "id", value: result.rootId })

      draft.selectedInstanceId = result.rootId
    })
  }

  return (
    <div className="p-2 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 px-1">Templates</div>
      {[...grouped].map(([category, templates]) => (
        <div key={category} className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 px-1">{category}</div>
          <div className="flex flex-col gap-1">
            {templates.map((t) => (
              <button key={t.id} onClick={() => handleInsert(t.id)}
                className="text-left px-2 py-2 rounded hover:bg-gray-100 transition-colors">
                <div className="text-xs font-medium">{t.name}</div>
                <div className="text-[10px] text-gray-400">{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
