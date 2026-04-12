"use client"
import { useMemo } from "react"
import { useStore } from "../use-store"
import { getAllMetas } from "../../registry/registry"
import { canAcceptChild } from "../../registry/content-model"

export function ComponentsPanel() {
  const s = useStore()
  const selectedComponent = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId)?.component : undefined

  const grouped = useMemo(() => {
    const groups = new Map<string, { name: string; label: string; disabled: boolean }[]>()
    for (const [name, meta] of getAllMetas()) {
      const disabled = selectedComponent ? !canAcceptChild(selectedComponent, name) : false
      const list = groups.get(meta.category) ?? []
      list.push({ name, label: meta.label, disabled })
      groups.set(meta.category, list)
    }
    return groups
  }, [selectedComponent])

  const handleAdd = (component: string) => {
    if (!s.selectedInstanceId) return
    const parent = s.instances.get(s.selectedInstanceId)
    if (!parent) return
    const id = s.addInstance(s.selectedInstanceId, parent.children.length, component)
    s.select(id)
  }

  return (
    <div className="p-2 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 px-1">Components</div>
      {[...grouped].map(([category, items]) => (
        <div key={category} className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 px-1">{category}</div>
          <div className="grid grid-cols-2 gap-1">
            {items.map((item) => (
              <button key={item.name} disabled={item.disabled} onClick={() => handleAdd(item.name)}
                draggable={!item.disabled}
                onDragStart={(e) => { e.dataTransfer.setData("component-name", item.name); e.dataTransfer.effectAllowed = "copy" }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-left">
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {!s.selectedInstanceId && <p className="text-xs text-gray-400 px-1">Select an instance to add children</p>}
    </div>
  )
}
