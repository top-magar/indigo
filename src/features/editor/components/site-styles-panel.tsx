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

type Tab = "all" | "colors" | "typography" | "layout" | "buttons" | "animations" | "advanced"

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "layout", label: "Layout" },
  { id: "buttons", label: "Buttons" },
  { id: "animations", label: "Animations" },
  { id: "advanced", label: "Advanced" },
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

interface ThemeState {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  // Typography
  headingFont: string
  bodyFont: string
  headingScale: number
  bodyScale: number
  headingLetterSpacing: number
  bodyLineHeight: number
  // Layout
  borderRadius: number
  maxWidth: number
  sectionSpacingV: number
  sectionSpacingH: number
  // Buttons
  buttonShape: string
  buttonStyle: string
  buttonShadow: string
  // Animations
  revealOnScroll: boolean
  hoverEffect: string
  pageTransition: string
  // Advanced
  faviconUrl: string
  customCss: string
}

const defaults: ThemeState = {
  primaryColor: "#000000", secondaryColor: "#6b7280", accentColor: "#3b82f6",
  backgroundColor: "#ffffff", textColor: "#111827",
  headingFont: "Inter", bodyFont: "Inter",
  headingScale: 100, bodyScale: 100,
  headingLetterSpacing: 0, bodyLineHeight: 1.6,
  borderRadius: 8, maxWidth: 1152,
  sectionSpacingV: 0, sectionSpacingH: 0,
  buttonShape: "rounded", buttonStyle: "solid", buttonShadow: "none",
  revealOnScroll: false, hoverEffect: "none", pageTransition: "none",
  faviconUrl: "", customCss: "",
}

function init(i: Record<string, unknown>): ThemeState {
  const t = { ...defaults }
  for (const k of Object.keys(defaults) as (keyof ThemeState)[]) {
    if (i[k] !== undefined && i[k] !== null) (t as Record<string, unknown>)[k] = i[k]
  }
  return t
}

export function SiteStylesPanel({ tenantId, initial, pageId, onThemeChange }: SiteStylesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [theme, setTheme] = useState<ThemeState>(() => init(initial))
  const [saving, startSave] = useTransition()
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const set = <K extends keyof ThemeState>(key: K, val: ThemeState[K]) => {
    const next = { ...theme, [key]: val }
    setTheme(next)
    onThemeChange?.(next as unknown as Record<string, unknown>)
    setActivePreset(null)
  }

  const applyPreset = (p: typeof presets[number]) => {
    const next = { ...theme, primaryColor: p.primary, secondaryColor: p.secondary, accentColor: p.accent, backgroundColor: p.bg, textColor: p.text }
    setTheme(next)
    onThemeChange?.(next as unknown as Record<string, unknown>)
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

  const show = (t: Tab) => activeTab === "all" || activeTab === t

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <link rel="stylesheet" href={fontLink} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, padding: '6px 4px 0', borderBottom: '1px solid var(--editor-border)', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '5px 6px', fontSize: 10, fontWeight: activeTab === t.id ? 600 : 400,
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 10px' }}>

        {/* ── COLORS ── */}
        {show("colors") && (
          <>
            <SectionHead>Presets</SectionHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, marginBottom: 14 }}>
              {presets.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 5,
                  border: activePreset === p.name ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                  background: activePreset === p.name ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}>
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
                  <input type="text" value={theme[key]} onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set(key, e.target.value) }}
                    style={{ width: 68, height: 22, padding: '0 4px', fontSize: 11, fontFamily: 'monospace', textAlign: 'center', background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 3, color: 'var(--editor-text-secondary)', outline: 'none' }}
                  />
                </div>
              ))}
            </div>

            <SectionHead>Shape</SectionHead>
            <div style={{ marginBottom: 14 }}>
              <RangeRow label="Radius" value={theme.borderRadius} unit="px" min={0} max={24} onChange={(v) => set("borderRadius", v)} />
              <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'center' }}>
                {[0, 4, 8, 16, 24].map((r) => (
                  <button key={r} onClick={() => set("borderRadius", r)} style={{
                    width: 28, height: 28, borderRadius: r,
                    border: theme.borderRadius === r ? '2px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                    background: theme.borderRadius === r ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {theme.borderRadius === r && <Check style={{ width: 12, height: 12, color: 'var(--editor-accent)' }} />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── TYPOGRAPHY ── */}
        {show("typography") && (
          <>
            <SectionHead>Fonts</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              <FontSelect label="Heading" value={theme.headingFont} onChange={(v) => set("headingFont", v)} />
              <FontSelect label="Body" value={theme.bodyFont} onChange={(v) => set("bodyFont", v)} />
            </div>

            <SectionHead>Scale</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              <RangeRow label="Heading size" value={theme.headingScale} unit="%" min={75} max={150} step={5} onChange={(v) => set("headingScale", v)} />
              <RangeRow label="Body size" value={theme.bodyScale} unit="%" min={75} max={150} step={5} onChange={(v) => set("bodyScale", v)} />
            </div>

            <SectionHead>Spacing</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              <RangeRow label="Heading tracking" value={theme.headingLetterSpacing} unit="em" min={-0.05} max={0.2} step={0.01} onChange={(v) => set("headingLetterSpacing", v)} />
              <RangeRow label="Body line height" value={theme.bodyLineHeight} unit="" min={1.2} max={2.2} step={0.1} onChange={(v) => set("bodyLineHeight", v)} />
            </div>

            {/* Preview */}
            <div style={{ padding: '8px 10px', borderRadius: 4, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
              <p style={{ fontFamily: theme.headingFont, fontSize: 14 * (theme.headingScale / 100), fontWeight: 700, lineHeight: 1.2, letterSpacing: `${theme.headingLetterSpacing}em`, color: 'var(--editor-text)', margin: 0 }}>Heading Preview</p>
              <p style={{ fontFamily: theme.bodyFont, fontSize: 12 * (theme.bodyScale / 100), lineHeight: theme.bodyLineHeight, color: 'var(--editor-text-secondary)', margin: '4px 0 0' }}>Body text in {theme.bodyFont} at {theme.bodyScale}% scale with {theme.bodyLineHeight} line height.</p>
            </div>
            <div style={{ height: 14 }} />
          </>
        )}

        {/* ── LAYOUT ── */}
        {show("layout") && (
          <>
            <SectionHead>Max Width</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {[
                { value: 960, label: "960px", desc: "Narrow" },
                { value: 1152, label: "1152px", desc: "Default" },
                { value: 1280, label: "1280px", desc: "Wide" },
                { value: 1440, label: "1440px", desc: "Extra wide" },
                { value: 0, label: "Full", desc: "No limit" },
              ].map((opt) => (
                <OptionBtn key={opt.value} selected={theme.maxWidth === opt.value} onClick={() => set("maxWidth", opt.value)} label={opt.label} desc={opt.desc} />
              ))}
              <RangeRow label="Custom" value={theme.maxWidth || 1600} unit="px" min={800} max={1600} step={8} onChange={(v) => set("maxWidth", v)} />
            </div>

            <SectionHead>Section Spacing</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              <RangeRow label="Vertical gap" value={theme.sectionSpacingV} unit="px" min={0} max={100} step={4} onChange={(v) => set("sectionSpacingV", v)} />
              <RangeRow label="Horizontal padding" value={theme.sectionSpacingH} unit="px" min={0} max={80} step={4} onChange={(v) => set("sectionSpacingH", v)} />
            </div>
          </>
        )}

        {/* ── BUTTONS ── */}
        {show("buttons") && (
          <>
            <SectionHead>Button Shape</SectionHead>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {(["square", "rounded", "pill"] as const).map((s) => (
                <button key={s} onClick={() => set("buttonShape", s)} style={{
                  flex: 1, height: 32, borderRadius: s === "square" ? 2 : s === "rounded" ? 6 : 16,
                  border: theme.buttonShape === s ? '2px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                  background: theme.buttonShape === s ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 500, color: 'var(--editor-text)',
                }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <SectionHead>Button Style</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {(["solid", "outline", "ghost"] as const).map((s) => (
                <OptionBtn key={s} selected={theme.buttonStyle === s} onClick={() => set("buttonStyle", s)}
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  desc={s === "solid" ? "Filled background" : s === "outline" ? "Border only" : "Text only"} />
              ))}
            </div>

            <SectionHead>Button Shadow</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
              {(["none", "sm", "md", "lg"] as const).map((s) => (
                <OptionBtn key={s} selected={theme.buttonShadow === s} onClick={() => set("buttonShadow", s)}
                  label={s === "none" ? "None" : s.toUpperCase()} desc={s === "none" ? "Flat" : `${s} shadow`} />
              ))}
            </div>
          </>
        )}

        {/* ── ANIMATIONS ── */}
        {show("animations") && (
          <>
            <SectionHead>Reveal on Scroll</SectionHead>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 0' }}>
                <input type="checkbox" checked={theme.revealOnScroll} onChange={(e) => set("revealOnScroll", e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--editor-accent)', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>Reveal sections on scroll</div>
                  <div style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>Sections fade in as visitors scroll down</div>
                </div>
              </label>
            </div>

            <SectionHead>Hover Effect</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
              {([
                { value: "none", label: "None", desc: "No hover animation" },
                { value: "lift", label: "Vertical Lift", desc: "Cards shift up on hover" },
                { value: "3d-lift", label: "3D Lift", desc: "Cards lift forward with shine" },
                { value: "scale", label: "Scale", desc: "Cards grow slightly on hover" },
              ] as const).map((opt) => (
                <OptionBtn key={opt.value} selected={theme.hoverEffect === opt.value} onClick={() => set("hoverEffect", opt.value)} label={opt.label} desc={opt.desc} />
              ))}
            </div>

            <SectionHead>Page Transitions</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
              {([
                { value: "none", label: "None" },
                { value: "fade", label: "Fade" },
                { value: "slide-left", label: "Slide Left" },
                { value: "slide-up", label: "Slide Up" },
              ] as const).map((opt) => (
                <OptionBtn key={opt.value} selected={theme.pageTransition === opt.value} onClick={() => set("pageTransition", opt.value)} label={opt.label} />
              ))}
              <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', margin: '2px 0 0' }}>Applies when visitors navigate between pages.</p>
            </div>
          </>
        )}

        {/* ── ADVANCED ── */}
        {show("advanced") && (
          <>
            <SectionHead>Favicon</SectionHead>
            <div style={{ marginBottom: 10 }}>
              {theme.faviconUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={theme.faviconUrl} alt="Favicon" style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid var(--editor-border)' }} />
                  <button onClick={() => set("faviconUrl", "")} style={{ fontSize: 11, color: 'var(--editor-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                </div>
              ) : (
                <div>
                  <input type="text" placeholder="Paste favicon URL (32×32px)" value={theme.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)}
                    style={{ width: '100%', height: 28, padding: '0 8px', fontSize: 12, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 4, color: 'var(--editor-text)', outline: 'none' }} />
                  <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', margin: '4px 0 0' }}>Recommended: 32×32px PNG or SVG</p>
                </div>
              )}
            </div>

            <SectionHead>Custom CSS</SectionHead>
            <div style={{ marginBottom: 14 }}>
              <textarea
                value={theme.customCss}
                onChange={(e) => set("customCss", e.target.value)}
                placeholder={".my-class {\n  color: red;\n}"}
                spellCheck={false}
                style={{
                  width: '100%', height: 120, padding: 8, fontSize: 12, fontFamily: 'monospace',
                  background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
                  borderRadius: 4, color: 'var(--editor-text)', outline: 'none', resize: 'vertical',
                  lineHeight: 1.5, tabSize: 2,
                }}
              />
              <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', margin: '4px 0 0' }}>Applies to your entire store. Does not affect checkout.</p>
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

/* ── Shared components ── */

function SectionHead({ children }: { children: string }) {
  return <p style={{ fontSize: 10, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--editor-text-disabled)', margin: '0 0 6px' }}>{children}</p>
}

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)', width: 52, flexShrink: 0 }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, height: 26, padding: '0 6px', fontSize: 12, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 3, color: 'var(--editor-text)', cursor: 'pointer', fontFamily: value }}>
        {fontOptions.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
      </select>
    </div>
  )
}

function RangeRow({ label, value, unit, min, max, step, onChange }: { label: string; value: number; unit: string; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const display = Number.isInteger(value) ? value : value.toFixed(2).replace(/0$/, "")
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: 'var(--editor-text)' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--editor-text-secondary)', background: 'var(--editor-fill-secondary)', padding: '0 4px', borderRadius: 3, lineHeight: '18px' }}>{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%', accentColor: 'var(--editor-accent)', height: 4 }} />
    </div>
  )
}

function OptionBtn({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc?: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 5,
      border: selected ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
      background: selected ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
      cursor: 'pointer', transition: 'all 0.1s', textAlign: 'left',
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>{desc}</div>}
      </div>
      {selected && <Check style={{ width: 14, height: 14, color: 'var(--editor-accent)', flexShrink: 0 }} />}
    </button>
  )
}
