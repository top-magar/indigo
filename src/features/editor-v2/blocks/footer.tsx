interface FooterProps {
  logo: string; storeName: string; description: string; columns: string
  showNewsletter: boolean; newsletterHeading: string; newsletterDescription: string
  socialLinks: string; showPaymentIcons: boolean; copyright: string
  backgroundColor: string; textColor: string
}

export function Footer({ logo, storeName, description, columns, showNewsletter, newsletterHeading, newsletterDescription, socialLinks, showPaymentIcons, copyright, backgroundColor, textColor }: FooterProps) {
  const cols: { title: string; links: string }[] = (() => { try { return JSON.parse(columns) } catch { return [] } })()
  const socials: { platform: string; url: string }[] = (() => { try { return JSON.parse(socialLinks) } catch { return [] } })()
  const muted = { color: textColor, opacity: 0.6 }

  return (
    <footer style={{ backgroundColor, color: textColor }} className="px-6 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Top: logo + name + description */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {logo && <img src={logo} alt="" className="h-8 w-auto" />}
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--store-font-heading)" }}>{storeName}</span>
          </div>
          {description && <p className="text-sm" style={muted}>{description}</p>}
        </div>

        {/* Middle: columns + newsletter */}
        <div className="grid gap-8 mb-8" style={{ gridTemplateColumns: `repeat(${cols.length + (showNewsletter ? 1 : 0) || 1}, minmax(0, 1fr))` }}>
          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold mb-3" style={{ fontFamily: "var(--store-font-heading)" }}>{col.title}</h4>
              <ul className="space-y-2">
                {col.links.split("\n").filter(Boolean).map((l, j) => (
                  <li key={j}><a href="#" className="text-sm hover:opacity-70" style={muted}>{l.trim()}</a></li>
                ))}
              </ul>
            </div>
          ))}
          {showNewsletter && (
            <div>
              <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--store-font-heading)" }}>{newsletterHeading}</h4>
              <p className="text-sm mb-3" style={muted}>{newsletterDescription}</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded text-sm text-gray-900" />
                <button className="px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--store-color-primary)", borderRadius: "var(--store-btn-radius)" }}>Subscribe</button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6" style={{ borderTop: `1px solid ${textColor}22` }}>
          {copyright && <p className="text-sm" style={muted}>{copyright}</p>}
          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map((s, i) => (
                <a key={i} href={s.url} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-70" style={{ background: `${textColor}22` }}>{s.platform[0]?.toUpperCase()}</a>
              ))}
            </div>
          )}
          {showPaymentIcons && (
            <div className="flex gap-2 text-xs" style={muted}>
              {["Visa", "MC", "Amex", "PayPal"].map(p => <span key={p} className="px-2 py-1 rounded" style={{ border: `1px solid ${textColor}33` }}>{p}</span>)}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
