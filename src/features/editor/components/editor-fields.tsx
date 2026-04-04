"use client"

import { type ReactNode, useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { ImagePickerField } from "./image-picker-field"

// Shared input style matching Polaris tokens
const inputStyle: React.CSSProperties = {
  height: 32, width: '100%', padding: '0 8px',
  fontSize: 13, fontFamily: 'inherit',
  background: 'var(--editor-input-bg)',
  border: '1px solid var(--editor-border)',
  borderRadius: 'var(--editor-radius)',
  color: 'var(--editor-text)',
  outline: 'none', transition: 'border-color 0.1s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--editor-text-secondary)', marginBottom: 4,
}

// ---------------------------------------------------------------------------
// Section — collapsible group
// ---------------------------------------------------------------------------
export function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          padding: '8px 0', fontSize: 11, fontWeight: 650,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          color: 'var(--editor-text-secondary)', background: 'none',
          border: 'none', cursor: 'pointer',
        }}
      >
        {open
          ? <ChevronDown className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
        }
        {title}
      </button>
      {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextField
// ---------------------------------------------------------------------------
export function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--editor-accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextAreaField
// ---------------------------------------------------------------------------
export function TextAreaField({ label, value, onChange, rows = 2, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{ ...inputStyle, height: 'auto', padding: '6px 8px', resize: 'vertical' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--editor-accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// ColorField — swatch + hex input
// ---------------------------------------------------------------------------
export function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ position: 'relative', flexShrink: 0 }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, cursor: 'pointer', opacity: 0 }}
          />
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--editor-radius)',
            border: '1px solid var(--editor-border)', backgroundColor: value,
          }} />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SliderField
// ---------------------------------------------------------------------------
export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
        <span style={{
          fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)',
          background: 'var(--editor-fill-secondary)', padding: '1px 6px', borderRadius: 4,
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        style={{ width: '100%', accentColor: 'var(--editor-accent)' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// SelectField
// ---------------------------------------------------------------------------
export function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[] | string[]
}) {
  const opts = options.map((o) => typeof o === "string" ? { value: o, label: o } : o)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
      >
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ToggleField — switch with label
// ---------------------------------------------------------------------------
export function ToggleField({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{label}</span>
        {description && <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', marginTop: 1 }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--editor-accent)' : 'var(--editor-border)',
          position: 'relative', transition: 'background 0.15s', flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: 8, background: 'white',
          position: 'absolute', top: 2,
          left: checked ? 18 : 2, transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ImageField
// ---------------------------------------------------------------------------
export function ImageField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <ImagePickerField label={label} value={value} onChange={onChange} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// NumberField
// ---------------------------------------------------------------------------
export function NumberField({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row — horizontal layout
// ---------------------------------------------------------------------------
export function Row({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{children}</div>
}
