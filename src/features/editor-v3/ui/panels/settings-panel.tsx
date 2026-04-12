"use client"
import type { PropSchema } from "../../types"
import { useStore } from "../use-store"
import { getMeta } from "../../registry/registry"

function PropField({ schema, value, onChange }: { schema: PropSchema; value: unknown; onChange: (v: unknown) => void }) {
  const base = "w-full px-2 py-1.5 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none"
  if (schema.options) {
    return <select value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className={base}>{schema.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
  }
  if (schema.type === "boolean") return <input type="checkbox" checked={Boolean(value ?? schema.defaultValue)} onChange={(e) => onChange(e.target.checked)} className="rounded" />
  if (schema.type === "number") return <input type="number" value={Number(value ?? schema.defaultValue ?? 0)} onChange={(e) => onChange(Number(e.target.value))} className={base} />
  if (schema.multiline) return <textarea value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className={`${base} font-mono resize-y`} rows={4} />
  return <input type="text" value={String(value ?? schema.defaultValue ?? "")} onChange={(e) => onChange(e.target.value)} className={base} />
}

export function SettingsPanel() {
  const s = useStore()
  const instance = s.selectedInstanceId ? s.instances.get(s.selectedInstanceId) : undefined

  if (!s.selectedInstanceId || !instance) {
    return (
      <div className="p-4 text-center">
        <div className="text-xs text-gray-400 mb-1">No element selected</div>
        <div className="text-[10px] text-gray-300">Click an element on the canvas or navigator</div>
      </div>
    )
  }

  const meta = getMeta(instance.component)
  const propValues = new Map<string, unknown>()
  for (const p of s.props.values()) { if (p.instanceId === s.selectedInstanceId) propValues.set(p.name, p.value) }

  return (
    <div className="p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-medium text-gray-700">{meta?.label ?? instance.component}</div>
          <div className="text-[10px] text-gray-400">{instance.component} · {instance.id.slice(0, 6)}</div>
        </div>
        <button onClick={() => { s.removeInstance(s.selectedInstanceId!); s.select(null) }}
          className="text-[10px] text-red-400 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors">Delete</button>
      </div>
      <div className="mb-3">
        <label className="text-[10px] text-gray-500 block mb-1">Label</label>
        <input type="text" value={instance.label ?? ""} onChange={(e) => s.setInstanceLabel(s.selectedInstanceId!, e.target.value)}
          className="w-full px-2 py-1.5 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none" placeholder={meta?.label} />
      </div>
      {meta?.propsSchema && meta.propsSchema.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-[10px] font-medium text-gray-500 mb-2">Properties</div>
          {meta.propsSchema.map((schema) => (
            <div key={schema.name} className="mb-2.5">
              <label className="text-[10px] text-gray-500 block mb-1">{schema.label}</label>
              <PropField schema={schema} value={propValues.get(schema.name)} onChange={(v) => s.setProp(s.selectedInstanceId!, schema.name, schema.type, v as never)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
