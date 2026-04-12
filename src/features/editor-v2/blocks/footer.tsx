import { safeParseJson, SocialIcon } from "./shared-utils"

type Layout = "columns" | "minimal" | "big-brand" | "centered"

interface FooterProps {
  layout: Layout
  logo: string
  storeName: string
  description: string
  columns: string
  showNewsletter: boolean
  newsletterHeading: string
  newsletterDescription: string
  socialLinks: string
  showPaymentIcons: boolean
  copyright: string
  backgroundColor: string
  textColor: string
}

interface Column { title: string; links: string }
interface Social { platform: string; url: string }

const paymentLabels = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"]

export function Footer({
  layout = "columns", logo, storeName, description, columns, showNewsletter,
  newsletterHeading, newsletterDescription, socialLinks, showPaymentIcons,
  copyright, backgroundColor, textColor,
}: FooterProps) {
  const cols = safeParseJson<Column[]>(columns, [])
  const socials = safeParseJson<Social[]>(socialLinks, [])
  const muted = `color-mix(in srgb, ${textColor} 60%, transparent)`
  const borderColor = `color-mix(in srgb, ${textColor} 12%, transparent)`
  const isCentered = layout === "centered"
  const isMinimal = layout === "minimal"
  const isBigBrand = layout === "big-brand"

  // Flatten column links for minimal/centered layouts
  const allLinks = cols.flatMap(c => c.links.split("\n").filter(Boolean).map(l => l.trim()))

  return (
    <footer style={{ backgroundColor, color: textColor }} className="px-6 py-10" role="contentinfo">
      <div className={`max-w-[1200px] mx-auto ${isCentered ? "text-center" : ""}`}>

        {/* Brand */}
        <div className={`mb-8 ${isCentered ? "flex flex-col items-center" : "flex items-center gap-2.5"} ${isMinimal ? "inline-flex" : ""}`}>
          {logo && <img src={logo} alt="" className={isBigBrand ? "h-12 w-auto" : "h-8 w-auto"} />}
          <span className={`font-semibold ${isBigBrand ? "text-3xl" : "text-lg"}`}
            style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)" }}>{storeName}</span>
          {description && !isMinimal && <p className="text-sm max-w-xs mt-2" style={{ color: muted }}>{description}</p>}
        </div>

        {/* Columns or flat links */}
        {isMinimal || isCentered ? (
          <nav className={`flex flex-wrap gap-4 mb-6 ${isCentered ? "justify-center" : ""}`}>
            {allLinks.slice(0, isCentered ? undefined : 6).map((l, i) => (
              <a key={i} href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ color: muted }}>{l}</a>
            ))}
          </nav>
        ) : (
          <div className={`grid gap-8 mb-8 ${isBigBrand ? "grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4" : "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-12"}`}>
            {!isBigBrand && <div className="@lg:col-span-4" />}
            <div className={isBigBrand ? "contents" : "@lg:col-span-8 grid grid-cols-2 @sm:grid-cols-3 gap-8"}>
              {cols.map((col, i) => (
                <div key={i}>
                  <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)" }}>{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.split("\n").filter(Boolean).map((l, j) => (
                      <li key={j}><a href="#" className="text-sm hover:opacity-70 transition-opacity" style={{ color: muted }}>{l.trim()}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
              {showNewsletter && (
                <div className={isCentered ? "w-full max-w-sm mx-auto" : ""}>
                  <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)" }}>{newsletterHeading}</h4>
                  <p className="text-sm mb-3" style={{ color: muted }}>{newsletterDescription}</p>
                  <div className="flex gap-2">
                    <input type="email" aria-label="Email for newsletter" placeholder="Your email" className="flex-1 px-3 py-2 rounded text-sm text-gray-900 min-w-0" />
                    <button className="px-4 py-2 text-sm font-medium text-white shrink-0" style={{ background: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>Subscribe</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Newsletter for centered/minimal */}
        {(isCentered || isMinimal) && showNewsletter && (
          <div className={`mb-6 ${isCentered ? "max-w-sm mx-auto" : ""}`}>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)" }}>{newsletterHeading}</h4>
            <p className="text-sm mb-3" style={{ color: muted }}>{newsletterDescription}</p>
            <div className="flex gap-2">
              <input type="email" aria-label="Email for newsletter" placeholder="Your email" className="flex-1 px-3 py-2 rounded text-sm text-gray-900 min-w-0" />
              <button className="px-4 py-2 text-sm font-medium text-white shrink-0" style={{ background: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>Subscribe</button>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className={`flex flex-wrap items-center gap-4 pt-6 ${isCentered ? "justify-center" : "justify-between"}`} style={{ borderTop: `1px solid ${borderColor}` }}>
          {copyright && <p className="text-sm" style={{ color: muted }}>{copyright}</p>}
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map((s, i) => <SocialIcon key={i} platform={s.platform} url={s.url} color={textColor} />)}
            </div>
          )}
          {showPaymentIcons && (
            <div className="flex gap-2">
              {paymentLabels.map(p => (
                <span key={p} className="px-2 py-1 rounded text-[10px] font-medium" style={{ border: `1px solid ${borderColor}`, color: muted }}>{p}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
