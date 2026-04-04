"use client"

import { useState, useTransition, useEffect } from "react"
import { PanelTop, PanelBottom } from "lucide-react"
import { saveGlobalSectionsAction, getGlobalSectionsAction } from "../actions"
import { toast } from "sonner"

interface GlobalSectionsPanelProps {
  tenantId: string
}

export function GlobalSectionsPanel({ tenantId }: GlobalSectionsPanelProps) {
  const [headerEnabled, setHeaderEnabled] = useState(false)
  const [footerEnabled, setFooterEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [saving, startSave] = useTransition()

  useEffect(() => {
    getGlobalSectionsAction(tenantId).then((r) => {
      if (r.success) {
        setHeaderEnabled(r.headerEnabled)
        setFooterEnabled(r.footerEnabled)
      }
      setLoaded(true)
    })
  }, [tenantId])

  const handleSave = () => {
    startSave(async () => {
      const result = await saveGlobalSectionsAction(tenantId, { headerEnabled, footerEnabled })
      if (result.success) toast.success("Global sections saved")
      else toast.error(result.error || "Failed to save")
    })
  }

  if (!loaded) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <GlobalToggle icon={PanelTop} label="Global Header" desc="Navigation bar on all pages" checked={headerEnabled} onChange={setHeaderEnabled} />
      <GlobalToggle icon={PanelBottom} label="Global Footer" desc="Footer links on all pages" checked={footerEnabled} onChange={setFooterEnabled} />

      <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', lineHeight: '16px' }}>
        When enabled, the header and footer appear on all pages including products and checkout.
      </p>

      <button onClick={handleSave} disabled={saving} className="editor-btn-primary" style={{ width: '100%', opacity: saving ? 0.5 : 1 }}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  )
}

function GlobalToggle({ icon: Icon, label, desc, checked, onChange }: {
  icon: typeof PanelTop; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 12, borderRadius: 'var(--editor-radius)',
      border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon className="h-4 w-4" style={{ color: 'var(--editor-icon-secondary)' }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>{label}</p>
          <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)' }}>{desc}</p>
        </div>
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
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}
