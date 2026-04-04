"use client"

import { useState, useTransition } from "react"
import { saveThemeAction } from "../actions"
import { toast } from "sonner"

interface ThemePanelProps {
  tenantId: string
  initial: Record<string, unknown>
  pageId?: string | null
}

const fontOptions = [
  "Inter", "System UI", "Georgia", "Playfair Display", "Roboto",
  "Open Sans", "Lato", "Montserrat", "Poppins", "DM Sans",
]

const colorPresets = [
  { name: "Minimal", primary: "#000000", secondary: "#6b7280", accent: "#000000", background: "#ffffff", text: "#111827" },
  { name: "Ocean", primary: "#0ea5e9", secondary: "#64748b", accent: "#06b6d4", background: "#f8fafc", text: "#0f172a" },
  { name: "Forest", primary: "#16a34a", secondary: "#6b7280", accent: "#22c55e", background: "#f0fdf4", text: "#14532d" },
  { name: "Sunset", primary: "#f97316", secondary: "#78716c", accent: "#ef4444", background: "#fffbeb", text: "#431407" },
  { name: "Royal", primary: "#7c3aed", secondary: "#6b7280", accent: "#a855f7", background: "#faf5ff", text: "#1e1b4b" },
  { name: "Dark", primary: "#e2e8f0", secondary: "#94a3b8", accent: "#3b82f6", background: "#0f172a", text: "#f1f5f9" },
] as const

const colorFields = [
  { key: "primaryColor", label: "Primary", desc: "Buttons, links, accents" },
  { key: "secondaryColor", label: "Secondary", desc: "Supporting elements" },
  { key: "accentColor", label: "Accent", desc: "Highlights, badges" },
  { key: "backgroundColor", label: "Background", desc: "Page background" },
  { key: "textColor", label: "Text", desc: "Body text color" },
] as const

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--editor-text-secondary)', marginBottom: 8,
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: 32, padding: '0 8px', fontSize: 13,
  background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
  borderRadius: 4, color: 'var(--editor-text)', cursor: 'pointer',
}

export function ThemePanel({ tenantId, initial, pageId }: ThemePanelProps) {
  const [theme, setTheme] = useState({
    primaryColor: (initial.primaryColor as string) || "#000000",
    secondaryColor: (initial.secondaryColor as string) || "#6b7280",
    accentColor: (initial.accentColor as string) || "#3b82f6",
    backgroundColor: (initial.backgroundColor as string) || "#ffffff",
    textColor: (initial.textColor as string) || "#111827",
    headingFont: (initial.headingFont as string) || "Inter",
    bodyFont: (initial.bodyFont as string) || "Inter",
    borderRadius: (initial.borderRadius as number) || 8,
  })
  const [saving, startSave] = useTransition()

  const update = <K extends keyof typeof theme>(key: K, val: (typeof theme)[K]) => {
    setTheme((t) => ({ ...t, [key]: val }))
  }

  const handleSave = () => {
    startSave(async () => {
      const res = await saveThemeAction(tenantId, theme, pageId ?? undefined)
      if (res.success) toast.success("Theme saved")
      else toast.error(res.error || "Failed to save theme")
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px' }}>
      {/* Color Presets */}
      <div>
        <p style={sectionLabel}>Quick Presets</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setTheme((t) => ({ ...t, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent, backgroundColor: preset.background, textColor: preset.text }))}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: 8, borderRadius: 4,
                border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
                cursor: 'pointer', transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
            >
              <div style={{ display: 'flex', gap: 2 }}>
                {[preset.primary, preset.secondary, preset.accent, preset.background].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--editor-border)', backgroundColor: c }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--editor-text-secondary)' }}>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <p style={sectionLabel}>Colors</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {colorFields.map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ position: 'relative', flexShrink: 0 }}>
                <input type="color" value={theme[key]} onChange={(e) => update(key, e.target.value)} style={{ position: 'absolute', inset: 0, cursor: 'pointer', opacity: 0 }} />
                <div style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid var(--editor-border)', backgroundColor: theme[key] }} />
              </label>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>{desc}</p>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--editor-text-secondary)' }}>{theme[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p style={sectionLabel}>Typography</p>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${fontOptions.filter(f => f !== "System UI").map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--editor-text)', marginBottom: 4 }}>Heading Font</span>
            <select value={theme.headingFont} onChange={(e) => update("headingFont", e.target.value)} style={selectStyle}>
              {fontOptions.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </label>
          <label>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--editor-text)', marginBottom: 4 }}>Body Font</span>
            <select value={theme.bodyFont} onChange={(e) => update("bodyFont", e.target.value)} style={selectStyle}>
              {fontOptions.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </label>
          <div style={{ padding: 8, borderRadius: 4, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
            <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', marginBottom: 4 }}>Preview</p>
            <p style={{ fontFamily: theme.headingFont, fontSize: 16, fontWeight: 700, lineHeight: 1.2, color: 'var(--editor-text)' }}>Heading Font</p>
            <p style={{ fontFamily: theme.bodyFont, fontSize: 13, marginTop: 4, color: 'var(--editor-text)' }}>Body text in {theme.bodyFont}.</p>
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <p style={sectionLabel}>Shape</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>Corner Radius</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--editor-text-secondary)', background: 'var(--editor-fill-secondary)', padding: '0 4px', borderRadius: 4, lineHeight: '20px' }}>{theme.borderRadius}px</span>
        </div>
        <input type="range" min={0} max={24} value={theme.borderRadius} onChange={(e) => update("borderRadius", +e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)' }} />
      </div>

      <button onClick={handleSave} disabled={saving} className="editor-btn-primary" style={{ width: '100%', height: 32, opacity: saving ? 0.5 : 1 }}>
        {saving ? "Saving…" : "Save Theme"}
      </button>
    </div>
  )
}
