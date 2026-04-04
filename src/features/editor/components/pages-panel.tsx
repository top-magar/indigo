"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { FileText, Plus, Trash2, Home, X } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "../actions"
import { toast } from "sonner"

interface Page {
  id: string
  name: string
  slug: string
  is_homepage: boolean
  status: string
}

const templates = [
  { id: "blank", label: "Blank" },
  { id: "homepage", label: "Homepage" },
  { id: "landing", label: "Landing" },
  { id: "product", label: "Product" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const

type TemplateId = (typeof templates)[number]["id"]

interface PagesPanelProps {
  tenantId: string
  currentPageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
}

export function PagesPanel({ tenantId, currentPageId, onPageChange }: PagesPanelProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [template, setTemplate] = useState<TemplateId>("blank")
  const [pending, startTransition] = useTransition()

  const loadPages = useCallback(() => {
    startTransition(async () => {
      const result = await listPagesAction(tenantId)
      if (result.success) setPages(result.pages)
    })
  }, [tenantId])

  useEffect(() => { loadPages() }, [loadPages])

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug = `/${newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    startTransition(async () => {
      const result = await createPageAction(tenantId, newName.trim(), slug)
      if (result.success) {
        toast.success(`"${newName}" created`)
        setNewName(""); setCreating(false); setTemplate("blank")
        loadPages()
        onPageChange(result.pageId!, null)
      } else toast.error(result.error || "Failed")
    })
  }

  const handleDelete = (page: Page) => {
    if (page.is_homepage) return
    if (!confirm(`Delete "${page.name}"?`)) return
    startTransition(async () => {
      const result = await deletePageAction(tenantId, page.id)
      if (result.success) {
        toast.success(`Deleted "${page.name}"`)
        loadPages()
        if (page.id === currentPageId) {
          const hp = pages.find((p) => p.is_homepage)
          if (hp) onPageChange(hp.id, null)
        }
      } else toast.error(result.error || "Failed")
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 8px' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-text)' }}>Pages</span>
        <button
          onClick={() => setCreating(true)}
          title="New page"
          style={{
            width: 22, height: 22, borderRadius: 4, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', cursor: 'pointer', color: 'var(--editor-icon-secondary)',
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Page list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {pages.map((page) => {
          const active = page.id === currentPageId
          return (
            <div
              key={page.id}
              onClick={() => onPageChange(page.id, null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', marginBottom: 1,
                background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.08))' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {page.is_homepage
                ? <Home style={{ width: 14, height: 14, flexShrink: 0, color: active ? 'var(--editor-accent)' : 'var(--editor-icon-secondary)' }} />
                : <FileText style={{ width: 14, height: 14, flexShrink: 0, color: active ? 'var(--editor-accent)' : 'var(--editor-icon-secondary)' }} />
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--editor-accent)' : 'var(--editor-text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{page.name}</div>
                <div style={{ fontSize: 10, color: 'var(--editor-text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.slug}</div>
              </div>
              {page.status === "draft" && (
                <span style={{ padding: '0 4px', borderRadius: 3, fontSize: 9, fontWeight: 600, background: '#fef3c7', color: '#92400e', lineHeight: '16px' }}>Draft</span>
              )}
              {!page.is_homepage && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(page) }}
                  style={{
                    padding: 2, border: 'none', background: 'none', cursor: 'pointer',
                    color: 'var(--editor-text-disabled)', opacity: 0, transition: 'opacity 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-disabled)' }}
                  className="group-hover:!opacity-100"
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ padding: 8, borderTop: '1px solid var(--editor-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--editor-text)' }}>New Page</span>
            <button onClick={() => { setCreating(false); setNewName("") }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-text-disabled)', padding: 0 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Page name" autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            style={{
              width: '100%', height: 28, padding: '0 8px', fontSize: 12,
              background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
              borderRadius: 6, color: 'var(--editor-text)', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 6 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer',
                  border: template === t.id ? '1px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                  background: template === t.id ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
                  color: template === t.id ? 'var(--editor-accent)' : 'var(--editor-text-secondary)',
                }}
              >{t.label}</button>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || pending}
            style={{
              width: '100%', height: 28, marginTop: 6, borderRadius: 6, border: 'none',
              background: 'var(--editor-fill-brand)', color: 'white',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              opacity: (!newName.trim() || pending) ? 0.5 : 1,
            }}
          >
            {pending ? "Creating…" : "Create Page"}
          </button>
        </div>
      )}
    </div>
  )
}
