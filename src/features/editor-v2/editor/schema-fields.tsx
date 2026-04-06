"use client"

/**
 * Schema-driven field components.
 * Each maps to a FieldDef type from core/schema.ts.
 * The inspector renders these automatically — no hand-written settings per block.
 */

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { FieldDef, TextFieldDef, NumberFieldDef, SpacingFieldDef, ColorFieldDef, EnumFieldDef, BooleanFieldDef, ImageFieldDef } from "../core/schema"
import { SPACING_STEP } from "../core/tokens"

interface FieldProps {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}

/** Route a FieldDef to the correct field component */
export function SchemaField({ field, value, onChange }: FieldProps) {
  switch (field.type) {
    case "text": return <TextField field={field} value={value as string} onChange={onChange} />
    case "number": return <NumberField field={field} value={value as number} onChange={onChange} />
    case "spacing": return <SpacingField field={field} value={value as number} onChange={onChange} />
    case "color": return <ColorField field={field} value={value as string} onChange={onChange} />
    case "enum": return <EnumField field={field} value={value as string} onChange={onChange} />
    case "boolean": return <BoolField field={field} value={value as boolean} onChange={onChange} />
    case "image": return <ImageField field={field} value={value as string} onChange={onChange} />
  }
}

function TextField({ field, value, onChange }: { field: TextFieldDef; value: string; onChange: (v: unknown) => void }) {
  if (field.multiline) {
    return (
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={3} className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-[12px] resize-y min-h-[60px]" />
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className="h-7 text-[12px]" />
    </div>
  )
}

function NumberField({ field, value, onChange }: { field: NumberFieldDef; value: number; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
        <span className="text-[10px] text-muted-foreground tabular-nums">{value}{field.unit ?? ""}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={field.min ?? 0} max={field.max ?? 100} step={field.step ?? 1} />
    </div>
  )
}

function SpacingField({ field, value, onChange }: { field: SpacingFieldDef; value: number; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
        <span className="text-[10px] text-muted-foreground tabular-nums">{value}px</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={field.min ?? 0} max={field.max ?? 120} step={SPACING_STEP} />
    </div>
  )
}

function ColorField({ field, value, onChange }: { field: ColorFieldDef; value: string; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
      <div className="flex gap-1.5 items-center">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded border border-input cursor-pointer p-0" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="h-7 text-[12px] font-mono flex-1" />
      </div>
    </div>
  )
}

function EnumField({ field, value, onChange }: { field: EnumFieldDef; value: string; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
      <div className="flex gap-0.5 rounded-md border border-input p-0.5">
        {field.options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className="flex-1 h-6 text-[11px] font-medium rounded-sm transition-colors"
            style={{ background: value === opt.value ? "var(--v2-editor-accent, #005bd3)" : "transparent", color: value === opt.value ? "#fff" : "inherit" }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function BoolField({ field, value, onChange }: { field: BooleanFieldDef; value: boolean; onChange: (v: unknown) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
      <Switch checked={value} onCheckedChange={(v) => onChange(v)} />
    </div>
  )
}

function ImageField({ field, value, onChange }: { field: ImageFieldDef; value: string; onChange: (v: unknown) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{field.label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" className="h-7 text-[12px]" />
      {value && <img src={value} alt="" className="w-full h-20 object-cover rounded border border-input mt-1" />}
    </div>
  )
}
