"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { FileText, Plus, Trash2, Home, ArrowLeft } from "lucide-react"
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
  { id: "blank", label: "Blank", desc: "Empty page, build from scratch", icon: "📄" },
  { id: "homepage", label: "Homepage", desc: "Hero, products, trust signals, newsletter", icon: "🏠" },
  { id: "landing", label: "Landing", desc: "Hero, features, CTA", icon: "🚀" },
  { id: "product", label: "Product", desc: "Featured product, grid, reviews", icon: "🛍️" },
  { id: "collection", label: "Collection", desc: "Banner, product grid", icon: "📦" },
  { id: "about", label: "About", desc: "Story, team, values", icon: "👋" },
  { id: "contact", label: "Contact", desc: "Form, map, FAQ", icon: "✉️" },
  { id: "blog", label: "Blog", desc: "Rich text, images, CTA", icon: "📝" },
] as const

type TemplateId = (typeof templates)[number]["id"]

interface PagesPanelProps {
  tenantId: string
  currentPageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
}

export function PagesPanel({ tenantId, currentPageId, onPageChange }: PagesPanelProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [view, setView] = useState<"list" | "create">("list")
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
        setNewName(""); setTemplate("blank"); setView("list")
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

  // ─── Create View ───
  if (view === "create") {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 12px 8px' }}>
          <button
            onClick={() => { setView("list"); setNewName(""); setTemplate("blank") }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-icon-secondary)', padding: 0, display: 'flex' }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-text)' }}>New Page</span>
        </div>

        {/* Name input */}
        <div style={{ padding: '0 12px 12px' }}>
          <input
            type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Page name" autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            style={{
              width: '100%', height: 32, padding: '0 10px', fontSize: 13,
              background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
              borderRadius: 6, color: 'var(--editor-text)', outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
          />
          {newName.trim() && (
            <div style={{ fontSize: 11, color: 'var(--editor-text-disabled)', marginTop: 4 }}>
              /{newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
            </div>
          )}
        </div>

        {/* Template cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--editor-text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Choose a template
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {templates.map((t) => {
              const active = template === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
                    borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                    border: active ? '1.5px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                    background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.06))' : 'var(--editor-surface)',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--editor-text-disabled)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--editor-border)' }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: active ? 'var(--editor-accent)' : 'var(--editor-text)' }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--editor-text-secondary)', marginTop: 1 }}>{t.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Create button */}
        <div style={{ padding: 12, borderTop: '1px solid var(--editor-border)' }}>
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || pending}
            style={{
              width: '100%', height: 34, borderRadius: 6, border: 'none',
              background: 'var(--editor-fill-brand)', color: 'white',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: (!newName.trim() || pending) ? 0.5 : 1,
            }}
          >
            {pending ? "Creating…" : "Create Page"}
          </button>
        </div>
      </div>
    )
  }

  // ─── List View ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 8px' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-text)' }}>Pages</span>
        <button
          onClick={() => setView("create")}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {pages.map((page) => {
          const active = page.id === currentPageId
          return (
            <div
              key={page.id}
              onClick={() => onPageChange(page.id, null)}
              className="group"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', marginBottom: 1,
                background: active ? 'var(--editor-accent-light, rgba(59,130,246,0.08))' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? 'var(--editor-accent-light, rgba(59,130,246,0.08))' : 'transparent' }}
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
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-disabled)'; e.currentTarget.style.opacity = '0' }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
