"use client"

import { useState } from "react"
import { Search, X, LayoutDashboard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useEditorStore } from "../../store"
import { designedSections } from "../../designed-sections"
import { getBlock } from "../../registry"
import { useSidebarState } from "../../sidebar-state"

const SECTION_GROUPS: Record<string, string[]> = {
  Navigation: ["header", "footer"],
  Layout: ["columns", "spacer", "container", "stack", "heroContainer", "headerContainer", "footerContainer"],
  Content: ["text", "richText", "headingBlock", "paragraphBlock", "image", "video", "divider", "map", "customCode"],
  Interactive: ["button", "iconButton", "navLinks", "logo", "linkGroup", "tabs", "form", "popup", "scrollProgress"],
  Commerce: ["productCard", "productGrid", "featuredProduct", "collectionList", "cartSummary", "pricingTable", "comparisonTable", "ctProductDetails", "ctProductList"],
  Marketing: ["hero", "newsletter", "newsletterForm", "testimonials", "faq", "promoBanner", "announcement", "announcementBar", "countdownTimer", "trustBadges", "logoCloud", "marquee", "socialIcons", "socialLinks", "copyrightBar", "ctCustomerReviews", "ctCategories"],
}

const ELEMENTS: Array<[string, string, string]> = [
  ["headingBlock", "Heading", "H1-H4 text heading"],
  ["paragraphBlock", "Paragraph", "Body text"],
  ["button", "Button", "Call-to-action button"],
  ["image", "Image", "Single image"],
  ["divider", "Divider", "Horizontal line"],
  ["spacer", "Spacer", "Vertical space"],
  ["navLinks", "Nav Links", "Navigation menu"],
  ["iconButton", "Icon Button", "Icon with action"],
  ["logo", "Logo", "Brand logo image"],
  ["linkGroup", "Link Group", "Title + list of links"],
  ["newsletterForm", "Newsletter", "Email signup form"],
  ["socialIcons", "Social Icons", "Social media icons"],
  ["socialLinks", "Social Links", "Social media buttons"],
  ["copyrightBar", "Copyright", "Footer copyright text"],
  ["announcement", "Announcement", "Dismissible banner"],
  ["container", "Container", "Flexible wrapper"],
  ["stack", "Stack", "Vertical/horizontal stack"],
]

const BLOCK_LABELS: Record<string, { label: string; description: string }> = {
  header: { label: "Header", description: "Site header with nav" },
  footer: { label: "Footer", description: "Site footer with links" },
  hero: { label: "Hero", description: "Full-width hero banner" },
  text: { label: "Text", description: "Simple text block" },
  richText: { label: "Rich Text", description: "Formatted HTML content" },
  headingBlock: { label: "Heading", description: "H1-H4 text heading" },
  paragraphBlock: { label: "Paragraph", description: "Body text" },
  faq: { label: "FAQ", description: "Questions & answers" },
  testimonials: { label: "Testimonials", description: "Customer quotes" },
  comparisonTable: { label: "Comparison Table", description: "Feature comparison" },
  tabs: { label: "Tabs", description: "Tabbed content panels" },
  productGrid: { label: "Product Grid", description: "Grid of products" },
  productCard: { label: "Product Card", description: "Single product card" },
  featuredProduct: { label: "Featured Product", description: "Spotlight a product" },
  collectionList: { label: "Collection List", description: "Browse collections" },
  cartSummary: { label: "Cart Summary", description: "Cart overview widget" },
  pricingTable: { label: "Pricing Table", description: "Plan comparison" },
  newsletter: { label: "Newsletter", description: "Email signup section" },
  newsletterForm: { label: "Newsletter Form", description: "Email signup form" },
  promoBanner: { label: "Promo Banner", description: "Promotional banner" },
  announcement: { label: "Announcement", description: "Dismissible banner" },
  announcementBar: { label: "Announcement Bar", description: "Top-of-page notice" },
  countdownTimer: { label: "Countdown Timer", description: "Urgency timer" },
  trustBadges: { label: "Trust Badges", description: "Trust signals row" },
  logoCloud: { label: "Logo Cloud", description: "Brand logos grid" },
  marquee: { label: "Marquee", description: "Scrolling text ticker" },
  popup: { label: "Popup", description: "Modal overlay" },
  image: { label: "Image", description: "Single image" },
  video: { label: "Video", description: "Embedded video" },
  map: { label: "Map", description: "Embedded map" },
  divider: { label: "Divider", description: "Horizontal line" },
  spacer: { label: "Spacer", description: "Vertical space" },
  customCode: { label: "Custom Code", description: "HTML/CSS embed" },
  scrollProgress: { label: "Scroll Progress", description: "Reading progress bar" },
  form: { label: "Form", description: "Contact/custom form" },
  button: { label: "Button", description: "Call-to-action button" },
  iconButton: { label: "Icon Button", description: "Icon with action" },
  navLinks: { label: "Nav Links", description: "Navigation menu" },
  logo: { label: "Logo", description: "Brand logo image" },
  linkGroup: { label: "Link Group", description: "Title + list of links" },
  socialIcons: { label: "Social Icons", description: "Social media icons" },
  socialLinks: { label: "Social Links", description: "Social media buttons" },
  copyrightBar: { label: "Copyright", description: "Footer copyright text" },
  columns: { label: "Columns", description: "Multi-column layout" },
  container: { label: "Container", description: "Flexible wrapper" },
  stack: { label: "Stack", description: "Vertical/horizontal stack" },
  heroContainer: { label: "Hero Container", description: "Hero wrapper with slots" },
  headerContainer: { label: "Header Container", description: "Header wrapper" },
  footerContainer: { label: "Footer Container", description: "Footer wrapper" },
  ctProductDetails: { label: "Product Details", description: "Creative Tim product page" },
  ctProductList: { label: "Product List", description: "Creative Tim product grid" },
  ctCustomerReviews: { label: "Customer Reviews", description: "Creative Tim reviews" },
  ctCategories: { label: "Categories", description: "Creative Tim categories" },
}

function matchesQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q.toLowerCase())
}

export function AddPanel() {
  const [query, setQuery] = useState("")
  const addSection = useEditorStore(s => s.addSection)
  const insertSection = useEditorStore(s => s.insertSection)
  const { insertIndex, setTab } = useSidebarState()

  const add = (type: string) => {
    if (insertIndex != null) insertSection(type, insertIndex)
    else addSection(type)
    setTab("sections")
  }

  const addDesigned = (build: () => import("../../store").Section) => {
    addSection(build())
    setTab("sections")
  }

  const q = query.trim()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-xs font-medium">Add to Page</span>
        <button onClick={() => setTab("sections")} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="px-3 pb-2 shrink-0 relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blocks..." className="h-7 text-xs pl-7" autoFocus />
      </div>
      <Tabs defaultValue="designed" className="flex flex-col flex-1 min-h-0">
        <div className="px-3 shrink-0">
          <TabsList className="w-full h-7">
            <TabsTrigger value="designed" className="text-[10px] flex-1">Designed</TabsTrigger>
            <TabsTrigger value="sections" className="text-[10px] flex-1">Sections</TabsTrigger>
            <TabsTrigger value="elements" className="text-[10px] flex-1">Elements</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="designed" className="flex-1 overflow-y-auto px-3 py-2 m-0">
          <div className="grid grid-cols-2 gap-2">
            {designedSections.filter((ds) => !q || matchesQuery(ds.name + ds.description, q)).map((ds) => (
              <button key={ds.id} onClick={() => addDesigned(ds.build)} className="flex flex-col items-start gap-1 p-2.5 rounded-md border hover:bg-accent text-left transition-colors">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-medium">{ds.name}</span>
                <span className="text-[9px] text-muted-foreground leading-tight">{ds.description}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="flex-1 overflow-y-auto px-3 py-2 m-0">
          {Object.entries(SECTION_GROUPS).map(([group, types]) => {
            const items = types.filter((t) => !q || matchesQuery((BLOCK_LABELS[t]?.label ?? t) + (BLOCK_LABELS[t]?.description ?? ""), q))
            if (!items.length) return null
            return (
              <div key={group} className="mb-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">{group}</div>
                {items.map((type) => {
                  const block = getBlock(type)
                  const Icon = block?.icon
                  const meta = BLOCK_LABELS[type]
                  return (
                    <button key={type} onClick={() => add(type)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-accent text-left transition-colors">
                      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium truncate">{meta?.label ?? type}</div>
                        <div className="text-[9px] text-muted-foreground truncate">{meta?.description ?? ""}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="elements" className="flex-1 overflow-y-auto px-3 py-2 m-0">
          <div className="grid grid-cols-2 gap-1">
            {ELEMENTS.filter(([, label, desc]) => !q || matchesQuery(label + desc, q)).map(([type, label]) => {
              const Icon = getBlock(type)?.icon
              return (
                <button key={type} onClick={() => add(type)} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left transition-colors">
                  {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <span className="text-[11px] truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
