import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react"

const icons = { search: Search, user: User, "shopping-bag": ShoppingBag, menu: Menu, x: X, heart: Heart } as const

interface IconButtonProps {
  icon: keyof typeof icons; size: number; label: string
}

export function IconButton({ icon, size = 20, label }: IconButtonProps) {
  const Icon = icons[icon] ?? Search
  return (
    <button type="button" className="inline-flex items-center gap-1.5" style={{ color: "var(--store-color-text, #0f172a)", background: "none", border: "none", cursor: "pointer" }}>
      <Icon size={size} />{label && <span className="text-sm">{label}</span>}
    </button>
  )
}
