interface TestimonialItem { quote: string; author: string; role: string }
interface TestimonialsProps {
  heading: string; items: string; columns: number; variant: "cards" | "minimal"
}

const parse = (s: string): TestimonialItem[] => { try { return JSON.parse(s) } catch { return [] } }

export function Testimonials({ heading, items, columns, variant }: TestimonialsProps) {
  const parsed = parse(items)
  return (
    <div className="py-12 px-6">
      {heading && <h2 className="mb-8 text-center text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      <div className="mx-auto max-w-5xl" style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24 }}>
        {parsed.map((t, i) => (
          <div key={i} className={variant === "cards" ? "border p-6" : "p-4"} style={variant === "cards" ? { borderRadius: "var(--store-radius)" } : undefined}>
            <p className="text-sm italic" style={{ color: "var(--store-color-muted)" }}>"{t.quote}"</p>
            <div className="mt-3 text-sm font-semibold">{t.author}</div>
            {t.role && <div className="text-xs" style={{ color: "var(--store-color-muted)" }}>{t.role}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
