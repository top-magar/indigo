"use client"

import { type ReactNode, useState, useRef, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { ImagePickerField } from "./image-picker-field"
import { ColorPickerPopover } from "./color-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"

// Section — collapsible group (Figma-style)
export function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Separator className="mt-1" />
      <CollapsibleTrigger className="flex items-center justify-between w-full h-8 px-3 text-xs font-semibold bg-transparent border-none cursor-pointer" style={{ color: 'var(--editor-text)' }}>
        {title}
        {open ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--editor-icon-secondary)' }} /> : <ChevronRight className="w-3 h-3" style={{ color: 'var(--editor-icon-secondary)' }} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2 px-3 pb-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// TextField
export function TextField({ label, value, onChange, placeholder, inline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; inline?: boolean
}) {
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs font-medium shrink-0 w-[72px]" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-[13px]" />
      </div>
    )
  }
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-[13px]" />
    </div>
  )
}

// TextAreaField
export function TextAreaField({ label, value, onChange, rows = 2, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="text-[13px] resize-y" />
    </div>
  )
}

// ColorField — swatch + hex input with custom picker
export function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="w-8 h-8 shrink-0 p-0 border" onClick={() => setOpen(!open)}
          style={{ backgroundColor: value || '#ffffff', borderColor: 'var(--editor-border)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs font-mono" />
      </div>
      {open && <ColorPickerPopover value={value || '#000000'} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  )
}

// SliderField — compact inline (Figma-style)
export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <Label className="text-xs font-medium" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
        <Input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}
          className="w-[52px] h-6 px-1 text-right text-[11px] font-mono" />
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="h-4" />
    </div>
  )
}

// SegmentedControl — using shadcn ToggleGroup
export function SegmentedControl({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string; icon?: React.ComponentType<{ style?: React.CSSProperties }> }[]
}) {
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v) }} className="w-full">
        {options.map((opt) => (
          <ToggleGroupItem key={opt.value} value={opt.value} className="flex-1 h-7 text-[11px] gap-1">
            {opt.icon && <opt.icon style={{ width: 14, height: 14 }} />}
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

// SelectField
export function SelectField({ label, value, onChange, options, inline }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[] | string[]; inline?: boolean
}) {
  const opts = options.map((o) => typeof o === "string" ? { value: o, label: o } : o)
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-xs font-medium shrink-0 w-[72px]" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-full px-2 text-[13px] rounded border cursor-pointer" style={{ background: 'var(--editor-input-bg)', borderColor: 'var(--editor-border)', color: 'var(--editor-text)' }}>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-full px-2 text-[13px] rounded border cursor-pointer" style={{ background: 'var(--editor-input-bg)', borderColor: 'var(--editor-border)', color: 'var(--editor-text)' }}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ToggleField — using shadcn Switch
export function ToggleField({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 min-h-[32px]">
      <div>
        <span className="text-xs font-medium" style={{ color: 'var(--editor-text)' }}>{label}</span>
        {description && <p className="text-[11px] mt-0" style={{ color: 'var(--editor-text-disabled)' }}>{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

// ImageField
export function ImageField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <ImagePickerField label={label} value={value} onChange={onChange} />
    </div>
  )
}

// NumberField
export function NumberField({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <div>
      <Label className="text-xs font-medium mb-1 block" style={{ color: 'var(--editor-text-secondary)' }}>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} className="h-8 text-[13px]" />
    </div>
  )
}

// Row — horizontal layout
export function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}
