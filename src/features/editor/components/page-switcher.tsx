"use client"

import { useState, useEffect, useTransition, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { FileText, Plus, Trash2, Home, ChevronDown } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "../actions"
import { toast } from "sonner"

const pageTemplates = [
  { id: "blank", label: "Blank page", desc: "Start from scratch" },
  { id: "landing", label: "Landing page", desc: "Hero + features + CTA" },
  { id: "about", label: "About page", desc: "Story + team + values" },
  { id: "contact", label: "Contact page", desc: "Form + map + info" },
] as const

type TemplateId = (typeof pageTemplates)[number]["id"]

interface Page {
  id: string
  name: string
  slug: string
  is_homepage: boolean
  status: string
}

interface PageSwitcherProps {
  tenantId: string
  currentPageId: string | null
  onPageChange: (pageId: string, craftJson: string | null) => void
}

export function PageSwitcher({ tenantId, currentPageId, onPageChange }: PageSwitcherProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("blank")
  const [pending, startTransition] = useTransition()

  const loadPages = useCallback(() => {
    startTransition(async () => {
      const result = await listPagesAction(tenantId)
      if (result.success) setPages(result.pages)
    })
  }, [tenantId])

  useEffect(() => { loadPages() }, [loadPages])

  const currentPage = pages.find((p) => p.id === currentPageId) ?? pages.find((p) => p.is_homepage)

  const handleCreate = () => {
    if (!newName.trim()) return
    const slug = newSlug.trim() || `/${newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    startTransition(async () => {
      const templateJson = selectedTemplate !== "blank" ? getTemplateJson(selectedTemplate) : undefined
      const result = await createPageAction(tenantId, newName.trim(), slug, templateJson)
      if (result.success) {
        toast.success(`Page "${newName}" created`)
        setNewName(""); setNewSlug(""); setSelectedTemplate("blank"); setShowCreate(false)
        loadPages()
        onPageChange(result.pageId!, templateJson ?? null)
      } else {
        toast.error(result.error || "Failed to create page")
      }
    })
  }

  const handleDelete = (page: Page) => {
    if (page.is_homepage) return
    if (!confirm(`Delete "${page.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deletePageAction(tenantId, page.id)
      if (result.success) {
        toast.success(`Page "${page.name}" deleted`)
        loadPages()
        if (page.id === currentPageId) {
          const homepage = pages.find((p) => p.is_homepage)
          if (homepage) onPageChange(homepage.id, null)
        }
      } else {
        toast.error(result.error || "Failed to delete")
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 28, padding: '0 8px', fontSize: 12,
    background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
    borderRadius: 6, color: 'var(--editor-text)', outline: 'none',
  }

  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-label="Switch page"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          borderRadius: 'var(--editor-radius)',
          border: '1px solid var(--editor-border)',
          background: 'var(--editor-surface-secondary)',
          fontSize: 12, fontWeight: 500, color: 'var(--editor-text)',
          cursor: 'pointer', transition: 'all 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--editor-surface-secondary)' }}
      >
        {currentPage?.is_homepage
          ? <Home className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
          : <FileText className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)' }} />
        }
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentPage?.name ?? "Homepage"}
        </span>
        <ChevronDown className="h-3 w-3" style={{ color: 'var(--editor-icon-secondary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown */}
      {open && (() => {
        const rect = triggerRef.current?.getBoundingClientRect()
        return createPortal(
        <div className="editor-shell" style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'auto' }} onClick={() => { setOpen(false); setShowCreate(false) }} />
          <div style={{
            position: 'fixed', left: rect?.left ?? 0, top: (rect?.bottom ?? 0) + 4,
            pointerEvents: 'auto',
            width: 260, borderRadius: 8, padding: 4,
            border: '1px solid var(--editor-border)',
            background: 'var(--editor-surface)',
            boxShadow: 'var(--editor-shadow-popover)',
          }}>
            <p style={{ padding: '4px 8px', fontSize: 10, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--editor-text-disabled)' }}>Pages</p>

            {pages.map((page) => (
              <div
                key={page.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 6, cursor: 'pointer', transition: 'background 0.1s',
                  background: page.id === currentPageId ? 'var(--editor-surface-selected)' : 'transparent',
                }}
                onClick={() => { onPageChange(page.id, null); setOpen(false) }}
                onMouseEnter={(e) => { if (page.id !== currentPageId) e.currentTarget.style.background = 'var(--editor-surface-hover)' }}
                onMouseLeave={(e) => { if (page.id !== currentPageId) e.currentTarget.style.background = 'transparent' }}
                className="group"
              >
                {page.is_homepage
                  ? <Home className="h-3 w-3 shrink-0" style={{ color: 'var(--editor-icon-secondary)' }} />
                  : <FileText className="h-3 w-3 shrink-0" style={{ color: 'var(--editor-icon-secondary)' }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: page.id === currentPageId ? 'var(--editor-accent)' : 'var(--editor-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--editor-text-disabled)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.slug}</p>
                </div>
                {page.status === "draft" && (
                  <span style={{ padding: '1px 4px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: '#fef3c7', color: '#92400e' }}>Draft</span>
                )}
                {!page.is_homepage && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(page) }}
                    aria-label={`Delete ${page.name}`}
                    style={{ padding: 2, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-text-disabled)', opacity: 0, transition: 'all 0.1s' }}
                    className="group-hover:!opacity-100"
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#c70a24' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--editor-text-disabled)' }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Create new page */}
            {showCreate ? (
              <div style={{ marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--editor-border)', background: 'var(--editor-surface-secondary)' }}>
                <input
                  type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Page name" style={inputStyle} autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
                />
                <input
                  type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="Slug (auto-generated)" style={{ ...inputStyle, marginTop: 4 }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
                  {pageTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      style={{
                        padding: '6px 8px', borderRadius: 6, textAlign: 'left', cursor: 'pointer',
                        border: selectedTemplate === t.id ? '1px solid var(--editor-accent)' : '1px solid var(--editor-border)',
                        background: selectedTemplate === t.id ? 'var(--editor-accent-light)' : 'var(--editor-surface)',
                        transition: 'all 0.1s',
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--editor-text)' }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--editor-text-disabled)' }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || pending}
                    className="editor-btn-primary"
                    style={{ flex: 1, opacity: (!newName.trim() || pending) ? 0.5 : 1 }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setNewName(""); setNewSlug(""); setSelectedTemplate("blank") }}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', background: 'none',
                      fontSize: 12, color: 'var(--editor-text-secondary)', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                  marginTop: 4, padding: '6px 8px', borderRadius: 6,
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, color: 'var(--editor-text-secondary)',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--editor-surface-hover)'; e.currentTarget.style.color = 'var(--editor-text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--editor-text-secondary)' }}
              >
                <Plus className="h-3 w-3" />
                New Page
              </button>
            )}
          </div>
        </div>
        , document.body)
      })()}
    </div>
  )
}

/** Generate Craft.js JSON for page templates */
function getTemplateJson(template: TemplateId): string {
  const templates: Record<string, string> = {
    landing: JSON.stringify({
      ROOT: { type: { resolvedName: "Container" }, isCanvas: true, props: { padding: 0, background: "transparent" }, nodes: ["hero1", "features1", "cta1"] },
      hero1: { type: { resolvedName: "HeroBlock" }, parent: "ROOT", props: { _v: 1, variant: "full", heading: "Your Headline Here", subheading: "A compelling description of your product or service", ctaText: "Get Started", ctaHref: "/products", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "Learn More", secondCtaHref: "#", backgroundImage: "", backgroundColor: "#f8fafc", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 40, minHeight: 500, contentPosition: "center", headingSize: 48, subheadingSize: 18, paddingTop: 80, paddingBottom: 80, contentMaxWidth: 640, showBadge: true, badgeText: "New" }, nodes: [] },
      features1: { type: { resolvedName: "ProductGridBlock" }, parent: "ROOT", props: { _v: 1, heading: "Featured Products", columns: 4, rows: 1, showPrice: true, showBadge: true }, nodes: [] },
      cta1: { type: { resolvedName: "NewsletterBlock" }, parent: "ROOT", props: { _v: 1, heading: "Stay Updated", subheading: "Get the latest news and offers", buttonText: "Subscribe", backgroundColor: "#f1f5f9" }, nodes: [] },
    }),
    about: JSON.stringify({
      ROOT: { type: { resolvedName: "Container" }, isCanvas: true, props: { padding: 0, background: "transparent" }, nodes: ["hero1", "text1", "trust1"] },
      hero1: { type: { resolvedName: "HeroBlock" }, parent: "ROOT", props: { _v: 1, variant: "minimal", heading: "Our Story", subheading: "Learn about who we are and what drives us", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 300, contentPosition: "center", headingSize: 42, subheadingSize: 18, paddingTop: 60, paddingBottom: 60, contentMaxWidth: 640, showBadge: false, badgeText: "" }, nodes: [] },
      text1: { type: { resolvedName: "RichTextBlock" }, parent: "ROOT", props: { _v: 1, content: "<p>Tell your story here. What makes your brand unique? What problem do you solve?</p>", maxWidth: 720, alignment: "center", padding: 48 }, nodes: [] },
      trust1: { type: { resolvedName: "TrustSignalsBlock" }, parent: "ROOT", props: { _v: 1 }, nodes: [] },
    }),
    contact: JSON.stringify({
      ROOT: { type: { resolvedName: "Container" }, isCanvas: true, props: { padding: 0, background: "transparent" }, nodes: ["hero1", "contact1", "faq1"] },
      hero1: { type: { resolvedName: "HeroBlock" }, parent: "ROOT", props: { _v: 1, variant: "minimal", heading: "Get in Touch", subheading: "We'd love to hear from you", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 250, contentPosition: "center", headingSize: 42, subheadingSize: 18, paddingTop: 60, paddingBottom: 40, contentMaxWidth: 640, showBadge: false, badgeText: "" }, nodes: [] },
      contact1: { type: { resolvedName: "ContactInfoBlock" }, parent: "ROOT", props: { _v: 1 }, nodes: [] },
      faq1: { type: { resolvedName: "FaqBlock" }, parent: "ROOT", props: { _v: 1, heading: "Frequently Asked Questions" }, nodes: [] },
    }),
  }
  return templates[template] || ""
}
