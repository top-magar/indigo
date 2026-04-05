"use client"

import { useState, useTransition } from "react"
import { saveThemeAction } from "../actions"
import { toast } from "sonner"
import { Check } from "lucide-react"

interface SiteStylesProps {
  tenantId: string
  initial: Record<string, unknown>
  pageId?: string | null
  onThemeChange?: (theme: Record<string, unknown>) => void
}

type Tab = "all" | "colors" | "typography" | "maxWidth" | "transitions"

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "maxWidth", label: "Max Width" },
  { id: "transitions", label: "Transitions" },
]

const fontOptions = [
  "Inter", "System UI", "Georgia", "Playfair Display", "Roboto",
  "Open Sans", "Lato", "Montserrat", "Poppins", "DM Sans",
]

const presets = [
  { name: "Minimal", primary: "#000000", secondary: "#6b7280", accent: "#000000", bg: "#ffffff", text: "#111827" },
  { name: "Ocean", primary: "#0ea5e9", secondary: "#64748b", accent: "#06b6d4", bg: "#f8fafc", text: "#0f172a" },
  { name: "Forest", primary: "#16a34a", secondary: "#6b7280", accent: "#22c55e", bg: "#f0fdf4", text: "#14532d" },
  { name: "Sunset", primary: "#f97316", secondary: "#78716c", accent: "#ef4444", bg: "#fffbeb", text: "#431407" },
  { name: "Royal", primary: "#7c3aed", secondary: "#6b7280", accent: "#a855f7", bg: "#faf5ff", text: "#1e1b4b" },
  { name: "Dark", primary: "#e2e8f0", secondary: "#94a3b8", accent: "#3b82f6", bg: "#0f172a", text: "#f1f5f9" },
]

const colorFields = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "accentColor", label: "Accent" },
  { key: "backgroundColor", label: "Background" },
  { key: "textColor", label: "Text" },
] as const

const maxWidthOptions = [
  { value: 960, label: "960px", desc: "Narrow" },
  { value: 1152, label: "1152px", desc: "Default" },
  { value: 1280, label: "1280px", desc: "Wide" },
  { value: 1440, label: "1440px", desc: "Extra wide" },
  { value: 0, label: "Full", desc: "No limit" },
]

const transitionOptions = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-up", label: "Slide Up" },
]

interface ThemeState {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  borderRadius: number
  maxWidth: number
  pageTransition: string
}

export function SiteStylesPanel({ tenantId, initial, pageId, onThemeChange }: SiteStylesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [theme, setTheme] = useState<ThemeState>({
    primaryColor: (initial.primaryColor as string) || "#000000",
    secondaryColor: (initial.secondaryColor as string) || "#6b7280",
    accentColor: (initial.accentColor as string) || "#3b82f6",
    backgroundColor: (initial.backgroundColor as string) || "#ffffff",
    textColor: (initial.textColor as string) || "#111827",
    headingFont: (initial.headingFont as string) || "Inter",
    bodyFont: (initial.bodyFont as string) || "Inter",
    borderRadius: (initial.borderRadius as number) || 8,
    maxWidth: (initial.maxWidth as number) || 1152,
    pageTransition: (initial.pageTransition as string) || "none",
  })
  const [saving, startSave] = useTransition()
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const set = <K extends keyof ThemeState>(key: K, val: ThemeState[K]) => {
    const next = { ...theme, [key]: val }
    setTheme(next)
    onThemeChange?.(next)
    setActivePreset(null)
  }

  const applyPreset = (p: typeof presets[number]) => {
    const next = { ...theme, primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent, backgroundColor: p.bg, textColor: p.text }
    setTheme(next)
    onThemeChange?.(next)
    setActivePreset(p.name)
  }

  const save = () => {
    startSave(async () => {
      const res = await saveThemeAction(tenantId, { ...theme } as Record<string, unknown>, pageId ?? undefined)
      if (res.success) toast.success("Site styles saved")
      else toast.error(res.error || "Failed")
    })
  }

  /* eslint-disable @next/next/no-page-custom-font */
  const fontLink = `https://fonts.googleapis.com/css2?${fontOptions.filter(f => f !== "System UI").map(f => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap`

  const showColors = activeTab === "all" || activeTab === "colors"
  const showTypography = activeTab === "all" || activeTab === "typography"
  const showMaxWidth = activeTab === "all" || activeTab === "maxWidth"
  const showTransitions = activeTab === "all" || activeTab === "transitions"

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <link rel="stylesheet" href={fontLink} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, padding: '6px 8px 0', borderBottom: '1px solid var(--editor-border)', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '5px 8px', fontSize: 11, fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? 'var(--editor-accent)' : 'var(--editor-text-secondary)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === t.id ? '2px solid var(--editor-accent)' : '2px solid transparent',
              whiteSpace: 'nowrap', transition: 'all 0.1s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 0' }}>

        {/* ── Colors ── */}
        {showColors && (
          <>
            <SectionHead>Presets</SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, marginBottom: 14 }}>
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 6px', borderRadius: 5,
                    border: activePreset === p.name ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                    background: activePreset === p.name ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
                    {[p.primary, p.accent, p.bg].map((c, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--editor-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </button>
              ))}
            </div>

            <SectionHead>Colors</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {colorFields.map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}>
                  <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
                    <input type="color" value={theme[key]} onChange={(e) => set(key, e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    <div style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--editor-border)', backgroundColor: theme[key] }} />
                  </label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)', flex: 1 }}>{label}</span>
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set(key, e.target.value) }}
                    style={{
                      width: 68, height: 22, padding: '0 4px', fontSize: 11,
                      fontFamily: 'monospace', textAlign: 'center',
                      background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
                      borderRadius: 3, color: 'var(--editor-text-secondary)', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            <SectionHead>Shape</SectionHead>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--editor-text)' }}>Radius</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)', background: 'var(--editor-fill-secondary)', padding: '0 4px', borderRadius: 3, lineHeight: '18px' }}>{theme.borderRadius}px</span>
              </div>
              <input type="range" min={0} max={24} value={theme.borderRadius} onChange={(e) => set("borderRadius", +e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)', height: 4 }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'center' }}>
                {[0, 4, 8, 16, 24].map((r) => (
                  <button
                    key={r}
                    onClick={() => set("borderRadius", r)}
                    style={{
                      width: 28, height: 28, borderRadius: r,
                      border: theme.borderRadius === r ? '2px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                      background: theme.borderRadius === r ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {theme.borderRadius === r && <Check style={{ width: 12, height: 12, color: 'var(--editor-accent)' }} />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Typography ── */}
        {showTypography && (
          <>
            <SectionHead>Typography</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <FontSelect label="Heading" value={theme.headingFont} onChange={(v) => set("headingFont", v)} />
              <FontSelect label="Body" value={theme.bodyFont} onChange={(v) => set("bodyFont", v)} />
              <div style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)', marginTop: 2 }}>
                <p style={{ fontFamily: theme.headingFont, fontSize: 14, fontWeight: 700, lineHeight: 1.2, color: 'var(--editor-text)', margin: 0 }}>Heading Preview</p>
                <p style={{ fontFamily: theme.bodyFont, fontSize: 12, color: 'var(--editor-text-secondary)', margin: '3px 0 0' }}>Body text in {theme.bodyFont}</p>
              </div>
            </div>
          </>
        )}

        {/* ── Max Width ── */}
        {showMaxWidth && (
          <>
            <SectionHead>Max Width</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              {maxWidthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("maxWidth", opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 5,
                    border: theme.maxWidth === opt.value ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                    background: theme.maxWidth === opt.value ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>{opt.desc}</div>
                  </div>
                  {theme.maxWidth === opt.value && <Check style={{ width: 14, height: 14, color: 'var(--editor-accent)' }} />}
                </button>
              ))}
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--editor-text)' }}>Custom</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)', background: 'var(--editor-fill-secondary)', padding: '0 4px', borderRadius: 3, lineHeight: '18px' }}>{theme.maxWidth || "∞"}px</span>
                </div>
                <input type="range" min={800} max={1600} step={8} value={theme.maxWidth || 1600} onChange={(e) => set("maxWidth", +e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)', height: 4 }} />
              </div>
            </div>
          </>
        )}

        {/* ── Page Transitions ── */}
        {showTransitions && (
          <>
            <SectionHead>Page Transitions</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              {transitionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("pageTransition", opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: 5,
                    border: theme.pageTransition === opt.value ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                    background: theme.pageTransition === opt.value ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{opt.label}</span>
                  {theme.pageTransition === opt.value && <Check style={{ width: 14, height: 14, color: 'var(--editor-accent)' }} />}
                </button>
              ))}
              <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', margin: '4px 0 0' }}>
                Applies when visitors navigate between pages on your store.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Save */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--editor-border)' }}>
        <button onClick={save} disabled={saving} className="editor-btn-primary" style={{ width: '100%', height: 30, fontSize: 12, opacity: saving ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save Styles"}
        </button>
      </div>
    </div>
  )
}

function SectionHead({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--editor-text-disabled)', margin: '0 0 6px' }}>
      {children}
    </p>
  )
}

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)', width: 52, flexShrink: 0 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, height: 26, padding: '0 6px', fontSize: 12,
          background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
          borderRadius: 3, color: 'var(--editor-text)', cursor: 'pointer',
          fontFamily: value,
        }}
      >
        {fontOptions.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
      </select>
    </div>
  )
}
