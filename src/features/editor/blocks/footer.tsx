"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, SegmentedControl, ToggleField, ImageField, NumberField, Row } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface FooterProps {
  storeName: string
  columns: string // JSON: [{title, links:[{label,href}]}]
  backgroundColor: string
  textColor: string
  showNewsletter: boolean
  newsletterHeading: string
  showSocial: boolean
  socialLinks: string // JSON: [{platform, url}]
  showPaymentIcons: boolean
  copyright: string
  paddingTop: number
  paddingBottom: number
}

const S = "text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70 cursor-pointer select-none py-2"
const F = "flex flex-col gap-1 text-xs font-medium text-muted-foreground"
const I = "rounded-md border border-border bg-background px-2 py-1.5 text-sm"

const defaultColumns = JSON.stringify([
  { title: "Shop", links: [{ label: "All Products", href: "/products" }, { label: "Collections", href: "/collections" }, { label: "New Arrivals", href: "/new" }] },
  { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Blog", href: "/blog" }] },
  { title: "Support", links: [{ label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/shipping" }, { label: "Returns", href: "/returns" }] },
])

const defaultSocial = JSON.stringify([
  { platform: "Instagram", url: "#" }, { platform: "Facebook", url: "#" }, { platform: "Twitter", url: "#" },
])

export const FooterBlock = (props: FooterProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { storeName, columns, backgroundColor, textColor, showNewsletter, newsletterHeading, showSocial, socialLinks, showPaymentIcons, copyright, paddingTop, paddingBottom } = props
  let cols: any[] = []; try { cols = JSON.parse(columns) } catch {}
  let socials: any[] = []; try { socials = JSON.parse(socialLinks) } catch {}

  return (
    <footer ref={craftRef(connect, drag)} style={{ backgroundColor, color: textColor, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length + (showNewsletter ? 1 : 0)}, 1fr)`, gap: 48 }}>
          {cols.map((col: any, i: number) => (
            <div key={i}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: "var(--store-font-heading)" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {(col.links || []).map((link: any, j: number) => (
                  <li key={j}><a href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, opacity: 0.7, textDecoration: "none", fontSize: 14 }}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
          {showNewsletter && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{newsletterHeading}</h4>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Email address" style={{ flex: 1, padding: "8px 12px", borderRadius: "var(--store-radius, 6px)", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "transparent", color: textColor, fontSize: 14 }} />
                <button style={{ padding: "8px 16px", borderRadius: "var(--store-radius, 6px)", backgroundColor: "var(--store-primary, #fff)", color: backgroundColor, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Subscribe</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${textColor}22`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, opacity: 0.6 }}>
          <span>{copyright || `© ${new Date().getFullYear()} ${storeName}`}</span>
          {showSocial && <div style={{ display: "flex", gap: 16 }}>{socials.map((s: any, i: number) => <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: textColor, opacity: 0.7, textDecoration: "none", fontSize: 13 }}>{s.platform}</a>)}</div>}
          {showPaymentIcons && <div style={{ display: "flex", gap: 8, fontSize: 11, opacity: 0.5 }}>Visa • Mastercard • eSewa • Khalti</div>}
        </div>
      </div>
    </footer>
  )
}

const FooterSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as FooterProps }))
  if (!props) return null
  const set = <K extends keyof FooterProps>(k: K, v: FooterProps[K]) => setProp((p: FooterProps) => { (p as any)[k] = v })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
                <TextField label="Store Name" value={props.storeName} onChange={(v) => set("storeName", v)} />
                <TextField label="Copyright" value={props.copyright} onChange={(v) => set("copyright", v)} placeholder="Auto-generated if empty" />
        <label className={F}>Link Columns (JSON)<textarea value={props.columns} onChange={(e) => set("columns", e.target.value)} className={`${I} font-mono`} rows={6} /></label>
      </Section>
      <Section title="Newsletter">
                <ToggleField label="Show Newsletter" checked={props.showNewsletter} onChange={(v) => set("showNewsletter", v)} />
        {props.showNewsletter &&         <TextField label="Heading" value={props.newsletterHeading} onChange={(v) => set("newsletterHeading", v)} />}
      </Section>
      <Section title="Social & Payments">
                <ToggleField label="Show Social Links" checked={props.showSocial} onChange={(v) => set("showSocial", v)} />
        {props.showSocial && <label className={F}>Social (JSON)<textarea value={props.socialLinks} onChange={(e) => set("socialLinks", e.target.value)} className={`${I} font-mono`} rows={3} /></label>}
                <ToggleField label="Show Payment Icons" checked={props.showPaymentIcons} onChange={(v) => set("showPaymentIcons", v)} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

FooterBlock.craft = {
  displayName: "Footer",
  props: { _v: 1, storeName: "My Store", columns: defaultColumns, backgroundColor: "#111827", textColor: "#f9fafb", showNewsletter: true, newsletterHeading: "Stay Updated", showSocial: true, socialLinks: defaultSocial, showPaymentIcons: true, copyright: "", paddingTop: 48, paddingBottom: 32 },
    hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false,
  rules: { canMoveIn: () => false },
  related: { settings: FooterSettings },
}
