"use client"

import { useState, useTransition } from "react"
import { FileText, Palette, Search, Globe, ChevronDown, ChevronRight, Save } from "lucide-react"
import { ThemePanel } from "./theme-panel"
import { SeoPanel } from "./seo-panel"
import { GlobalSectionsPanel } from "./global-sections-panel"
import { saveAsTemplateAction } from "../actions"
import { useEditor } from "@craftjs/core"
import { toast } from "sonner"

interface PageSettingsPanelProps {
  tenantId: string
  themeOverrides: Record<string, unknown>
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
}

export function PageSettingsPanel({ tenantId, themeOverrides, seoInitial, pageId }: PageSettingsPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--editor-text)', height: '100%', overflow: 'hidden' }}>
      {/* Header — 44px to match top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px',
        borderBottom: '1px solid var(--editor-border)',
      }}>
        <FileText style={{ width: 16, height: 16, color: 'var(--editor-icon-secondary)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Page Settings</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--editor-text-disabled)' }}>
          Select a block on the canvas to edit its properties.
        </div>

        <PageSection icon={Palette} title="Theme" defaultOpen>
          <ThemePanel tenantId={tenantId} initial={themeOverrides} pageId={pageId} />
        </PageSection>

        <PageSection icon={Search} title="SEO">
          <SeoPanel tenantId={tenantId} initial={seoInitial} pageId={pageId} />
        </PageSection>

        <PageSection icon={Globe} title="Global Sections">
          <GlobalSectionsPanel tenantId={tenantId} />
        </PageSection>

        <PageSection icon={Save} title="Save as Template">
          <SaveAsTemplate tenantId={tenantId} />
        </PageSection>
      </div>
    </div>
  )
}

function PageSection({ icon: Icon, title, defaultOpen, children }: {
  icon: typeof Palette; title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, width: '100%',
          height: 36, padding: '0 12px',
          fontSize: 12, fontWeight: 600, color: 'var(--editor-text)',
          background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
      >
        {open
          ? <ChevronDown style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight style={{ width: 12, height: 12, color: 'var(--editor-icon-secondary)' }} />
        }
        <Icon style={{ width: 14, height: 14, color: 'var(--editor-icon-secondary)' }} />
        {title}
      </button>
      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  )
}

function SaveAsTemplate({ tenantId }: { tenantId: string }) {
  const [name, setName] = useState("")
  const [saving, startSave] = useTransition()
  const { query } = useEditor()

  const handleSave = () => {
    if (!name.trim()) return
    const json = query.serialize()
    startSave(async () => {
      const res = await saveAsTemplateAction(tenantId, name.trim(), json)
      if (res.success) { toast.success("Template saved"); setName("") }
      else toast.error(res.error || "Failed to save")
    })
  }

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, color: 'var(--editor-text-secondary)' }}>
        Save the current page layout as a reusable template.
      </p>
      <input
        type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Template name…"
        style={{
          height: 32, padding: '0 8px', fontSize: 13,
          background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
          borderRadius: 4, color: 'var(--editor-text)', outline: 'none',
        }}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
      />
      <button
        onClick={handleSave} disabled={saving || !name.trim()}
        className="editor-btn-primary"
        style={{ width: '100%', height: 32, opacity: saving || !name.trim() ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Save Template"}
      </button>
    </div>
  )
}
