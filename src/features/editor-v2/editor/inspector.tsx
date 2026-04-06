"use client"

/**
 * Auto-generated Inspector — reads block schema, renders settings UI.
 * Zero hand-written settings per block. The schema IS the settings.
 */

import { useState } from "react"
import { getBlock, getBlockOrNull } from "../core/registry"
import { getContentFields, getFieldsByGroup } from "../core/schema"
import type { FieldDef } from "../core/schema"
import { SchemaField } from "./schema-fields"

interface InspectorProps {
  /** Block type name (e.g. "Hero") */
  blockType: string
  /** Current prop values */
  props: Record<string, unknown>
  /** Called when a prop changes */
  onPropChange: (key: string, value: unknown) => void
}

type Tab = "content" | "design"

export function Inspector({ blockType, props, onPropChange }: InspectorProps) {
  const [tab, setTab] = useState<Tab>("content")
  const block = getBlockOrNull(blockType)
  if (!block) return <div className="p-3 text-xs text-muted-foreground">Unknown block: {blockType}</div>

  const { schema } = block
  const contentFields = getContentFields(schema.fields)
  const hasContent = contentFields.length > 0
  const grouped = getFieldsByGroup(schema.fields)

  // Filter fields by tab
  const isContentField = (key: string): boolean => contentFields.some(([k]) => k === key)
  const visibleGroups = new Map<string, Array<[string, FieldDef]>>()
  for (const [group, fields] of grouped) {
    const filtered = fields.filter(([key]) => tab === "content" ? isContentField(key) : !isContentField(key))
    if (filtered.length > 0) visibleGroups.set(group, filtered)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Block name */}
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[12px] font-semibold">{schema.name}</span>
        {schema.description && <p className="text-[10px] text-muted-foreground mt-0.5">{schema.description}</p>}
      </div>

      {/* Content / Design tabs */}
      {hasContent && (
        <div className="flex border-b border-border">
          {(["content", "design"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-1.5 text-[11px] font-medium capitalize transition-colors"
              style={{ borderBottom: tab === t ? "2px solid var(--v2-editor-accent, #005bd3)" : "2px solid transparent", color: tab === t ? "var(--v2-editor-accent, #005bd3)" : undefined }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Fields grouped by section */}
      <div className="flex-1 overflow-y-auto">
        {Array.from(visibleGroups).map(([group, fields]) => (
          <div key={group} className="px-3 py-2 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{group}</p>
            {fields.map(([key, field]) => (
              <SchemaField key={key} field={field} value={props[key] ?? field.default} onChange={(v) => onPropChange(key, v)} />
            ))}
          </div>
        ))}

        {/* Presets */}
        {tab === "design" && schema.presets && schema.presets.length > 0 && (
          <div className="px-3 py-2 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Presets</p>
            <div className="grid grid-cols-2 gap-1">
              {schema.presets.map((preset) => (
                <button key={preset.label}
                  onClick={() => { for (const [k, v] of Object.entries(preset.props)) onPropChange(k, v) }}
                  className="h-7 text-[11px] font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
