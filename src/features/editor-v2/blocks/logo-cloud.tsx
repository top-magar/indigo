interface Logo { name: string; imageUrl: string }
interface LogoCloudProps {
  heading: string; logos: string; variant: "grid" | "marquee"; columns: number
}

const parse = (s: string): Logo[] => { try { return JSON.parse(s) } catch { return [] } }

export function LogoCloud({ heading, logos, variant, columns }: LogoCloudProps) {
  const items = parse(logos)
  return (
    <div className="py-12 px-6 text-center">
      {heading && <h2 className="mb-8 text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      {variant === "marquee" ? (
        <div className="overflow-hidden">
          <div className="flex animate-[marquee_20s_linear_infinite] gap-12">
            {[...items, ...items].map((l, i) => (
              <img key={i} src={l.imageUrl} alt={l.name} className="h-10 w-auto shrink-0 grayscale hover:grayscale-0 transition" />
            ))}
          </div>
          <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl" style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 32 }}>
          {items.map((l, i) => (
            <div key={i} className="flex items-center justify-center p-4">
              <img src={l.imageUrl} alt={l.name} className="h-10 w-auto grayscale hover:grayscale-0 transition" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
