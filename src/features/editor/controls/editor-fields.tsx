"use client"

import { type ReactNode, useState, useRef, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { ImagePickerField } from "../controls/image-picker-field"
import { ColorPickerPopover } from "../controls/color-picker"
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
      <Separator className="mt-2" />
      <CollapsibleTrigger className="flex items-center justify-between w-full h-8 px-3 text-[11px] font-semibold bg-transparent border-none cursor-pointer text-foreground">
        {title}
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-2.5 px-3 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// TextField
export function TextField({ label, value, onChange, placeholder, inline, aiRewrite }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; inline?: boolean; aiRewrite?: boolean
}) {
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <Label className="text-[11px] font-medium shrink-0 w-[72px] text-muted-foreground">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-7 text-[12px]" />
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
        {aiRewrite && (
          <button title="AI Rewrite — Coming soon" className="opacity-40 hover:opacity-70 transition-opacity" style={{ background: "none", border: "none", cursor: "default", padding: 0, lineHeight: 1 }}>
            <span style={{ fontSize: 12 }}>✨</span>
          </button>
        )}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-7 text-[12px]" />
    </div>
  )
}

// TextAreaField
export function TextAreaField({ label, value, onChange, rows = 2, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
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
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" className="w-7 h-7 shrink-0 p-0 border-input" onClick={() => setOpen(!open)}
          style={{ backgroundColor: value || '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono" />
      </div>
      {open && <ColorPickerPopover value={value || '#000000'} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  )
}

// SliderField — single-line: label | slider | number
export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] font-medium text-muted-foreground truncate shrink-0 w-[72px]">{label}</Label>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="h-4 flex-1" />
      <Input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}
        className="w-[48px] h-6 px-1 text-right text-[11px] font-mono shrink-0" />
    </div>
  )
}

// SegmentedControl — using shadcn ToggleGroup
export function SegmentedControl({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string; icon?: React.ComponentType<{ style?: React.CSSProperties; className?: string }>; iconOnly?: boolean }[]
}) {
  return (
    <div>
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v) }} className="w-full">
        {options.map((opt) => (
          <ToggleGroupItem key={opt.value} value={opt.value} className="flex-1 h-6 text-[11px] gap-0.5" title={opt.label}>
            {opt.icon && <opt.icon className="size-3.5" />}
            {!opt.iconOnly && opt.label}
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
        <Label className="text-[11px] font-medium shrink-0 w-[72px] text-muted-foreground">{label}</Label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-full px-2 text-[12px] rounded-md border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring">
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div>
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-full px-2 text-[12px] rounded-md border border-input bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring">
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
    <div className="flex items-center justify-between gap-2 min-h-[28px]">
      <div>
        <span className="text-[11px] font-medium text-foreground">{label}</span>
        {description && <p className="text-[11px] mt-0 text-muted-foreground">{description}</p>}
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
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
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
      <Label className="text-[11px] font-medium mb-0.5 block text-muted-foreground">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} className="h-7 text-[12px]" />
    </div>
  )
}

// Row — horizontal layout
export function Row({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}
