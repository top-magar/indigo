"use client"

import { type ReactNode, useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { ImagePickerField } from "./image-picker-field"

/*
 * 4px grid tokens
 * Input height: 32px | Radius: 4px | Font: 13px input, 12px label
 * Gap: 4px (label→input), 8px (between fields), 12px (section gap)
 */
const R = 4
const H = 32

const inputBase: React.CSSProperties = {
  height: H, width: '100%', padding: '0 8px',
  fontSize: 13, fontFamily: 'inherit',
  background: 'var(--editor-input-bg)',
  border: '1px solid var(--editor-border)',
  borderRadius: R, color: 'var(--editor-text)',
  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelBase: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--editor-text-secondary)', marginBottom: 4,
  userSelect: 'none',
}

const focusIn = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--editor-accent)' }
const focusOut = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.boxShadow = 'none' }

// Section — collapsible group with top divider (Figma-style)
export function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          height: 32, padding: 0, fontSize: 12, fontWeight: 600,
          color: 'var(--editor-text)', background: 'none',
          border: 'none', cursor: 'pointer',
          borderTop: '1px solid var(--editor-border)',
          marginTop: 4,
        }}
      >
        {title}
        {open
          ? <ChevronDown style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
        }
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>{children}</div>}
    </div>
  )
}

// TextField
export function TextField({ label, value, onChange, placeholder, inline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; inline?: boolean
}) {
  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)', flexShrink: 0, width: 72 }}>{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
      </div>
    )
  }
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
    </div>
  )
}

// TextAreaField
export function TextAreaField({ label, value, onChange, rows = 2, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...inputBase, height: 'auto', padding: '8px', resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
    </div>
  )
}

// ColorField — swatch + hex input
export function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ position: 'relative', flexShrink: 0 }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', inset: 0, cursor: 'pointer', opacity: 0 }} />
          <div style={{
            width: 32, height: 32, borderRadius: R,
            border: '1px solid var(--editor-border)', backgroundColor: value,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          }} />
        </label>
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} onFocus={focusIn} onBlur={focusOut} />
      </div>
    </div>
  )
}

// SliderField — compact inline (Figma-style)
export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ ...labelBase, marginBottom: 0 }}>{label}</label>
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: 52, height: 24, padding: '0 4px', textAlign: 'right',
            fontSize: 11, fontFamily: 'ui-monospace, monospace',
            background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
            borderRadius: R, color: 'var(--editor-text)', outline: 'none',
          }}
          onFocus={focusIn} onBlur={focusOut}
        />
      </div>
      <input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} style={{ width: '100%', accentColor: 'var(--editor-accent)' }} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)', flexShrink: 0, width: 72 }}>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div>
      <label style={labelBase}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer', appearance: 'auto' }}>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ToggleField
export function ToggleField({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 32 }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{label}</span>
        {description && <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', marginTop: 0 }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 32, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--editor-accent)' : 'var(--editor-border)',
          position: 'relative', transition: 'background 0.15s', flexShrink: 0,
        }}
      >
        <div style={{
          width: 14, height: 14, borderRadius: 7, background: 'white',
          position: 'absolute', top: 2,
          left: checked ? 16 : 2, transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }} />
      </button>
    </div>
  )
}

// ImageField
export function ImageField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={labelBase}>{label}</label>
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
      <label style={labelBase}>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} style={inputBase} onFocus={focusIn} onBlur={focusOut} />
    </div>
  )
}

// Row — horizontal layout
export function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{children}</div>
}
