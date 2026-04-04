"use client"

import { useState, useTransition } from "react"
import { saveSeoAction } from "../actions"
import { ImagePickerField } from "./image-picker-field"
import { toast } from "sonner"
import { Globe } from "lucide-react"

interface SeoPanelProps {
  tenantId: string
  initial: { title: string; description: string; ogImage: string }
  pageId?: string | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 32, padding: '0 8px', fontSize: 13,
  background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
  borderRadius: 'var(--editor-radius)', color: 'var(--editor-text)', outline: 'none',
}

export function SeoPanel({ tenantId, initial, pageId }: SeoPanelProps) {
  const [seo, setSeo] = useState(initial)
  const [saving, startSave] = useTransition()

  const handleSave = () => {
    startSave(async () => {
      const res = await saveSeoAction(tenantId, seo, pageId ?? undefined)
      if (res.success) toast.success("SEO saved")
      else toast.error(res.error || "Failed to save")
    })
  }

  const titleLen = seo.title.length
  const descLen = seo.description.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>Page Title</span>
            <span style={{ fontSize: 11, color: titleLen > 60 ? '#c70a24' : 'var(--editor-text-disabled)' }}>{titleLen}/60</span>
          </div>
          <input
            type="text"
            value={seo.title}
            onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))}
            placeholder="My Store — Best Products"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
          />
        </label>

        <label>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--editor-text)' }}>Meta Description</span>
            <span style={{ fontSize: 11, color: descLen > 160 ? '#c70a24' : 'var(--editor-text-disabled)' }}>{descLen}/160</span>
          </div>
          <textarea
            value={seo.description}
            onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))}
            placeholder="Describe your store in 1-2 sentences…"
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '6px 8px', resize: 'vertical' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
          />
        </label>

        <ImagePickerField label="OG Image (Social Share)" value={seo.ogImage} onChange={(url) => setSeo((s) => ({ ...s, ogImage: url }))} />
      </div>

      {/* Google Preview */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--editor-text-secondary)', marginBottom: 8 }}>Search Preview</p>
        <div style={{ padding: 12, borderRadius: 'var(--editor-radius)', border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--editor-fill-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--editor-text-secondary)' }}>yourstore.com</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 13, fontWeight: 500, color: '#1a0dab', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {seo.title || "Page Title"}
          </p>
          <p style={{ marginTop: 4, fontSize: 12, color: 'var(--editor-text-secondary)', lineHeight: '18px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {seo.description || "Your page description will appear here in search results…"}
          </p>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="editor-btn-primary" style={{ width: '100%', opacity: saving ? 0.5 : 1 }}>
        {saving ? "Saving…" : "Save SEO"}
      </button>
    </div>
  )
}
