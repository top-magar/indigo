interface NewsletterProps {
  heading: string; subheading: string; buttonText: string
  variant: "inline" | "stacked" | "card"
}

export function Newsletter({ heading, subheading, buttonText, variant }: NewsletterProps) {
  const form = variant === "inline" ? (
    <div className="mt-4 flex gap-2">
      <input placeholder="Enter your email" className="flex-1 rounded border px-3 py-2 text-sm" />
      <button className="px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>
    </div>
  ) : (
    <div className="mt-4 flex flex-col gap-2">
      <input placeholder="Enter your email" className="rounded border px-3 py-2 text-sm" />
      <button className="px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>
    </div>
  )

  const inner = (
    <>
      {heading && <h2 className="text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      {subheading && <p className="mt-2" style={{ color: "var(--store-color-muted)" }}>{subheading}</p>}
      {form}
    </>
  )

  if (variant === "card") {
    return <div className="py-12 px-6"><div className="mx-auto max-w-lg rounded-2xl bg-gray-50 p-10 text-center">{inner}</div></div>
  }
  return <div className={`mx-auto max-w-lg py-12 px-6 ${variant === "stacked" ? "text-center" : ""}`}>{inner}</div>
}
