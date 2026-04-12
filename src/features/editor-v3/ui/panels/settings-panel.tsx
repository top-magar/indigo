"use client"
import type { PropSchema } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"

function PropField({ schema, value, onChange }: { schema: PropSchema; value: unknown; onChange: (v: unknown) => void }) {
  if (schema.options) {
    return <select value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1 text-xs border rounded bg-white">
      {schema.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  }
  if (schema.type === "boolean") return <input type="checkbox" checked={Boolean(value ?? schema.defaultValue)} onChange={(e) => onChange(e.target.checked)} />
  if (schema.type === "number") return <input type="number" value={Number(value ?? schema.defaultValue ?? 0)} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-2 py-1 text-xs border rounded" />
  if (schema.multiline) return <textarea value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1 text-xs border rounded font-mono resize-y" rows={4} />
  return <input type="text" value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1 text-xs border rounded" />
}

export function SettingsPanel() {
  const s = useStore()
  const instance = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId) : undefined

  if (!s.selectedInstanceId || !instance) return <div className="p-3 text-xs text-gray-400">Select an instance to edit</div>

  const meta = getMeta(instance.component)
  const propValues = new Map<string, unknown>()
  for (const p of s.props.values()) { if (p.instanceId === s.selectedInstanceId) propValues.set(p.name, p.value) }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">{meta?.label ?? instance.component}</span>
        <button onClick={() => { s.removeInstance(s.selectedInstanceId!); s.select(null) }} className="text-[10px] text-red-500 hover:text-red-700">Delete</button>
      </div>
      <div className="mb-3">
        <label className="text-[10px] text-gray-500 block mb-0.5">Label</label>
        <input type="text" value={instance.label ?? ""} onChange={(e) => s.setInstanceLabel(s.selectedInstanceId!, e.target.value)} className="w-full px-2 py-1 text-xs border rounded" placeholder={meta?.label} />
      </div>
      {meta?.propsSchema.map((schema) => (
        <div key={schema.name} className="mb-2">
          <label className="text-[10px] text-gray-500 block mb-0.5">{schema.label}</label>
          <PropField schema={schema} value={propValues.get(schema.name)} onChange={(v) => s.setProp(s.selectedInstanceId!, schema.name, schema.type, v as never)} />
        </div>
      ))}
    </div>
  )
}
