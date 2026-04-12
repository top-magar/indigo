interface SocialLinksProps {
  links: string; variant: "icons" | "pills" | "text"; size: "sm" | "md" | "lg"
}

const LETTERS: Record<string, string> = { facebook: "F", instagram: "I", twitter: "X", youtube: "Y", tiktok: "T", linkedin: "L", github: "G" }
const SIZES: Record<string, number> = { sm: 28, md: 36, lg: 48 }

export function SocialLinks({ links, variant, size }: SocialLinksProps) {
  const items: { platform: string; url: string }[] = (() => { try { return JSON.parse(links) } catch { return [] } })()
  const s = SIZES[size] || 36
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {items.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          className={variant === "pills" ? "rounded-full bg-gray-100 px-3 py-1 text-sm font-medium hover:bg-gray-200" : ""}
          style={variant === "text" ? { fontSize: s * 0.4 } : undefined}>
          {variant === "text" ? l.platform : (
            <svg width={s} height={s} viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="17" fill="var(--store-color-primary, #000)" />
              <text x="18" y="18" textAnchor="middle" dominantBaseline="central" fontSize="14" fill="#fff" fontWeight="600">
                {LETTERS[l.platform] || "?"}
              </text>
            </svg>
          )}
        </a>
      ))}
    </div>
  )
}
