"use client"

import { useEditor } from "@craftjs/core"
import { Section, ColorField, SliderField, Row } from "../controls/editor-fields"
import { Layers } from "lucide-react"
import { PanelShell } from "./panel-shell"
import { Button } from "@/components/ui/button"

export function BatchEditor() {
  const { selectedIds, actions, query } = useEditor((state) => ({
    selectedIds: [...state.events.selected],
  }))

  if (selectedIds.length < 2) return null

  const allProps = selectedIds.map((id) => {
    try { return query.node(id).get().data.props ?? {} }
    catch { return {} }
  })

  const has = (key: string) => allProps.every((p) => key in p)
  const setBatch = (key: string, val: unknown) => { for (const id of selectedIds) actions.setProp(id, (p: Record<string, unknown>) => { p[key] = val }) }
  const first = (key: string) => allProps[0]?.[key] as string ?? ""

  return (
    <PanelShell title={`${selectedIds.length} blocks selected`} icon={Layers}>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">Edit shared properties across all selected blocks.</p>
      </div>

      {(has("backgroundColor") || has("textColor")) && (
        <Section title="Style">
          {has("backgroundColor") && <ColorField label="Background" value={first("backgroundColor")} onChange={(v) => setBatch("backgroundColor", v)} />}
          {has("textColor") && <ColorField label="Text Color" value={first("textColor")} onChange={(v) => setBatch("textColor", v)} />}
        </Section>
      )}

      {(has("paddingTop") || has("paddingBottom")) && (
        <Section title="Spacing">
          <Row>
            {has("paddingTop") && <SliderField label="Pad Top" value={allProps[0]?.paddingTop as number ?? 0} onChange={(v) => setBatch("paddingTop", v)} min={0} max={120} />}
            {has("paddingBottom") && <SliderField label="Pad Bottom" value={allProps[0]?.paddingBottom as number ?? 0} onChange={(v) => setBatch("paddingBottom", v)} min={0} max={120} />}
          </Row>
        </Section>
      )}

      {has("hideOnDesktop") && (
        <Section title="Visibility" defaultOpen={false}>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px]" onClick={() => setBatch("hideOnDesktop", false)}>Show All</Button>
            <Button variant="outline" size="sm" className="flex-1 h-7 text-[11px]" onClick={() => setBatch("hideOnMobile", true)}>Hide Mobile</Button>
          </div>
        </Section>
      )}
    </PanelShell>
  )
}
