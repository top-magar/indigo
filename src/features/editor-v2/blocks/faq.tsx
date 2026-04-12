import { useState } from "react"

interface FaqItem { q: string; a: string }
interface FaqProps {
  heading: string; items: string; variant: "accordion" | "list"
}

const parse = (s: string): FaqItem[] => { try { return JSON.parse(s) } catch { return [] } }

export function FAQ({ heading, items, variant }: FaqProps) {
  const [open, setOpen] = useState<number | null>(0)
  const parsed = parse(items)

  return (
    <div className="mx-auto max-w-2xl py-12 px-6">
      {heading && <h2 className="mb-8 text-center text-2xl" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h2>}
      {parsed.map((item, i) => (
        <div key={i} className="border-b border-gray-200">
          {variant === "accordion" ? (
            <>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between py-4 text-left font-semibold">
                {item.q}<span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-4 text-sm" style={{ color: "var(--store-color-muted, #64748b)" }}>{item.a}</p>}
            </>
          ) : (
            <div className="py-4">
              <h4 className="font-semibold">{item.q}</h4>
              <p className="mt-2 text-sm" style={{ color: "var(--store-color-muted, #64748b)" }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
