"use client"

import { useState } from "react"
import { FileText, Palette, Search, Globe, ChevronDown, ChevronRight } from "lucide-react"
import { ThemePanel } from "./theme-panel"
import { SeoPanel } from "./seo-panel"
import { GlobalSectionsPanel } from "./global-sections-panel"

interface PageSettingsPanelProps {
  tenantId: string
  themeOverrides: Record<string, unknown>
  seoInitial: { title: string; description: string; ogImage: string }
  pageId: string | null
}

export function PageSettingsPanel({ tenantId, themeOverrides, seoInitial, pageId }: PageSettingsPanelProps) {
  return (
    <div className="flex flex-col" style={{ color: 'var(--editor-text)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--editor-border)',
        background: 'var(--editor-surface)',
      }}>
        <FileText className="h-4 w-4" style={{ color: 'var(--editor-icon-secondary)' }} />
        <span style={{ fontSize: 13, fontWeight: 650 }}>Page Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hint */}
        <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--editor-text-disabled)' }}>
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
      </div>
    </div>
  )
}

function PageSection({
  icon: Icon,
  title,
  defaultOpen,
  children,
}: {
  icon: typeof Palette
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div style={{ borderBottom: '1px solid var(--editor-border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '10px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--editor-text)', background: 'none',
          border: 'none', cursor: 'pointer', transition: 'background 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
      >
        {open
          ? <ChevronDown className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
          : <ChevronRight className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
        }
        <Icon className="h-3.5 w-3.5" style={{ color: 'var(--editor-icon-secondary)' }} />
        {title}
      </button>
      {open && <div style={{ paddingBottom: 8 }}>{children}</div>}
    </div>
  )
}
