"use client"

import { useState, useEffect, useTransition, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { FileText, Plus, Trash2, Home, ChevronDown } from "lucide-react"
import { listPagesAction, createPageAction, deletePageAction } from "../actions"
import { toast } from "sonner"

const pageTemplates = [
  { id: "blank", label: "Blank", desc: "Start from scratch" },
  { id: "homepage", label: "Homepage", desc: "Hero + products + trust + newsletter" },
  { id: "landing", label: "Landing", desc: "Hero + features + CTA" },
  { id: "product", label: "Product", desc: "Featured product + grid + reviews" },
  { id: "collection", label: "Collection", desc: "Banner + product grid + CTA" },
  { id: "about", label: "About", desc: "Story + team + values" },
  { id: "contact", label: "Contact", desc: "Form + map + FAQ" },
  { id: "blog", label: "Blog / Content", desc: "Rich text + images + CTA" },
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
        const el = document.querySelector('.editor-shell') ?? document.body
        return createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => { setOpen(false); setShowCreate(false) }} />
          <div style={{
            position: 'fixed', left: rect?.left ?? 0, top: (rect?.bottom ?? 0) + 4,
            zIndex: 9999,
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginTop: 8 }}>
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
        </>
        , el)
      })()}
    </div>
  )
}

/** Generate Craft.js JSON for page templates */
function getTemplateJson(template: TemplateId): string {
  const t = (nodes: Record<string, unknown>) => JSON.stringify(nodes)
  const node = (type: string, parent: string, props: Record<string, unknown>, nodeIds: string[] = []) => ({
    type: { resolvedName: type }, parent, props: { _v: 1, hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false, ...props }, nodes: nodeIds,
  })
  const root = (children: string[]) => ({
    ROOT: { type: { resolvedName: "Container" }, isCanvas: true, props: { padding: 0, background: "transparent" }, nodes: children },
  })

  const templates: Record<string, string> = {
    homepage: t({
      ...root(["h1", "p1", "iwt1", "t1", "n1"]),
      h1: node("HeroBlock", "ROOT", { variant: "full", heading: "Welcome to Our Store", subheading: "Discover products crafted with care", ctaText: "Shop Now", ctaHref: "/products", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "Learn More", secondCtaHref: "/about", backgroundImage: "", backgroundColor: "#f8fafc", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 40, minHeight: 520, contentPosition: "center", headingSize: 52, subheadingSize: 18, paddingTop: 80, paddingBottom: 80, contentMaxWidth: 640, showBadge: true, badgeText: "New Season" }),
      p1: node("ProductGridBlock", "ROOT", { heading: "Featured Products", headingAlignment: "center", columns: 4, rows: 1, gap: 24, cardStyle: "minimal", showVendor: false, showButton: true, buttonText: "Add to Cart", buttonStyle: "solid", backgroundColor: "#ffffff", paddingTop: 64, paddingBottom: 64 }),
      iwt1: node("ImageWithTextBlock", "ROOT", { heading: "Crafted with Purpose", text: "Every product tells a story. We source the finest materials and work with skilled artisans to bring you pieces that last.", buttonText: "Our Story", buttonLink: "/about", imagePosition: "left", imageRatio: "4:3", verticalAlign: "center", padding: 64, gap: 48, backgroundColor: "#f8fafc", textColor: "#111827" }),
      t1: node("TestimonialsBlock", "ROOT", { heading: "What Our Customers Say", subheading: "Real reviews from real people", variant: "grid", columns: 3, cardStyle: "bordered", showRating: true, showAvatar: true, backgroundColor: "#ffffff", paddingTop: 64, paddingBottom: 64 }),
      n1: node("NewsletterBlock", "ROOT", { heading: "Stay in the Loop", subheading: "Get exclusive deals and new arrivals straight to your inbox", buttonText: "Subscribe", variant: "card", maxWidth: 560, backgroundColor: "#111827", textColor: "#f1f5f9", paddingTop: 64, paddingBottom: 64 }),
    }),

    landing: t({
      ...root(["h1", "ts1", "p1", "cta1"]),
      h1: node("HeroBlock", "ROOT", { variant: "full", heading: "Your Headline Here", subheading: "A compelling description of your product or service", ctaText: "Get Started", ctaHref: "/products", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "Learn More", secondCtaHref: "#", backgroundImage: "", backgroundColor: "#f8fafc", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 40, minHeight: 500, contentPosition: "center", headingSize: 48, subheadingSize: 18, paddingTop: 80, paddingBottom: 80, contentMaxWidth: 640, showBadge: true, badgeText: "New" }),
      ts1: node("TrustSignalsBlock", "ROOT", { heading: "Trusted by thousands", variant: "grid", alignment: "center", paddingTop: 48, paddingBottom: 48, backgroundColor: "#ffffff", textColor: "#111827" }),
      p1: node("ProductGridBlock", "ROOT", { heading: "Featured Products", columns: 4, rows: 1, backgroundColor: "#ffffff", paddingTop: 64, paddingBottom: 64 }),
      cta1: node("NewsletterBlock", "ROOT", { heading: "Stay Updated", subheading: "Get the latest news and offers", buttonText: "Subscribe", backgroundColor: "#f1f5f9", paddingTop: 64, paddingBottom: 64 }),
    }),

    product: t({
      ...root(["fp1", "pg1", "rev1"]),
      fp1: node("FeaturedProductBlock", "ROOT", { productName: "Featured Product", productPrice: "$99.00", productDescription: "A detailed description of your best-selling product.", productImage: "", layout: "left", imageRatio: "1:1", imageRadius: 8, headingSize: 32, ctaText: "Add to Cart", ctaStyle: "solid", ctaBackground: "#000000", ctaColor: "#ffffff", backgroundColor: "#ffffff", textColor: "#111827", paddingTop: 64, paddingBottom: 64 }),
      pg1: node("ProductGridBlock", "ROOT", { heading: "You May Also Like", headingAlignment: "center", columns: 4, rows: 1, gap: 24, cardStyle: "minimal", backgroundColor: "#f8fafc", paddingTop: 64, paddingBottom: 64 }),
      rev1: node("TestimonialsBlock", "ROOT", { heading: "Customer Reviews", variant: "grid", columns: 2, showRating: true, showAvatar: true, backgroundColor: "#ffffff", paddingTop: 64, paddingBottom: 64 }),
    }),

    collection: t({
      ...root(["h1", "pg1", "pb1"]),
      h1: node("HeroBlock", "ROOT", { variant: "minimal", heading: "Shop Collection", subheading: "Browse our curated selection", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 200, contentPosition: "center", headingSize: 36, subheadingSize: 16, paddingTop: 48, paddingBottom: 32, contentMaxWidth: 640, showBadge: false, badgeText: "" }),
      pg1: node("ProductGridBlock", "ROOT", { heading: "", columns: 4, rows: 3, gap: 24, cardStyle: "minimal", showVendor: true, showButton: true, buttonText: "View", buttonStyle: "outline", backgroundColor: "#ffffff", paddingTop: 32, paddingBottom: 64 }),
      pb1: node("PromoBannerBlock", "ROOT", { text: "Free shipping on orders over $50", ctaText: "Shop Now", ctaLink: "/products", variant: "bar", backgroundColor: "#111827", textColor: "#f1f5f9" }),
    }),

    about: t({
      ...root(["h1", "txt1", "iwt1", "ts1"]),
      h1: node("HeroBlock", "ROOT", { variant: "minimal", heading: "Our Story", subheading: "Learn about who we are and what drives us", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 300, contentPosition: "center", headingSize: 42, subheadingSize: 18, paddingTop: 60, paddingBottom: 60, contentMaxWidth: 640, showBadge: false, badgeText: "" }),
      txt1: node("RichTextBlock", "ROOT", { content: "<h2>Our Mission</h2><p>Tell your story here. What makes your brand unique? What problem do you solve? Share the journey that brought you here.</p>", maxWidth: 720, alignment: "center", paddingTop: 48, paddingBottom: 48, backgroundColor: "#ffffff", textColor: "#111827" }),
      iwt1: node("ImageWithTextBlock", "ROOT", { heading: "Built with Care", text: "Every detail matters. From sourcing materials to the final stitch, we put quality first.", buttonText: "Meet the Team", buttonLink: "#", imagePosition: "right", imageRatio: "4:3", verticalAlign: "center", padding: 64, gap: 48, backgroundColor: "#f8fafc", textColor: "#111827" }),
      ts1: node("TrustSignalsBlock", "ROOT", { heading: "Our Values", variant: "grid", alignment: "center", paddingTop: 64, paddingBottom: 64, backgroundColor: "#ffffff", textColor: "#111827" }),
    }),

    contact: t({
      ...root(["h1", "c1", "faq1"]),
      h1: node("HeroBlock", "ROOT", { variant: "minimal", heading: "Get in Touch", subheading: "We'd love to hear from you", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 250, contentPosition: "center", headingSize: 42, subheadingSize: 18, paddingTop: 60, paddingBottom: 40, contentMaxWidth: 640, showBadge: false, badgeText: "" }),
      c1: node("ContactInfoBlock", "ROOT", { variant: "split", backgroundColor: "#ffffff", textColor: "#111827", paddingTop: 48, paddingBottom: 48 }),
      faq1: node("FaqBlock", "ROOT", { heading: "Frequently Asked Questions", variant: "accordion", backgroundColor: "#f8fafc", textColor: "#111827", paddingTop: 64, paddingBottom: 64 }),
    }),

    blog: t({
      ...root(["h1", "rt1", "n1"]),
      h1: node("HeroBlock", "ROOT", { variant: "minimal", heading: "Our Blog", subheading: "Stories, tips, and insights", ctaText: "", ctaHref: "", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000", secondCtaText: "", secondCtaHref: "", backgroundImage: "", backgroundColor: "#ffffff", backgroundPosition: "center", textColor: "#000000", overlayOpacity: 0, minHeight: 220, contentPosition: "center", headingSize: 36, subheadingSize: 16, paddingTop: 48, paddingBottom: 32, contentMaxWidth: 640, showBadge: false, badgeText: "" }),
      rt1: node("RichTextBlock", "ROOT", { content: "<h2>Article Title</h2><p>Start writing your content here. Use headings, paragraphs, lists, and images to create engaging articles for your audience.</p><h3>A Subheading</h3><p>Break up your content with subheadings to improve readability. Each section should focus on a single idea.</p>", maxWidth: 720, alignment: "left", paddingTop: 48, paddingBottom: 48, backgroundColor: "#ffffff", textColor: "#111827" }),
      n1: node("NewsletterBlock", "ROOT", { heading: "Enjoyed this article?", subheading: "Subscribe to get notified about new posts", buttonText: "Subscribe", variant: "stacked", maxWidth: 480, backgroundColor: "#f8fafc", textColor: "#111827", paddingTop: 48, paddingBottom: 64 }),
    }),
  }
  return templates[template] || ""
}
