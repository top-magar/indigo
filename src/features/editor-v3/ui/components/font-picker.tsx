"use client"
import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Type } from "lucide-react"

/** Popular Google Fonts — avoids API call, covers 95% of use cases */
const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway",
  "Nunito", "Playfair Display", "Merriweather", "Source Sans 3", "Oswald",
  "Noto Sans", "Ubuntu", "Rubik", "Work Sans", "DM Sans", "Manrope",
  "Outfit", "Space Grotesk", "Plus Jakarta Sans", "Sora", "Figtree",
  "Geist", "Lexend", "Quicksand", "Mulish", "Barlow", "Karla", "Cabin",
  "Libre Baskerville", "Lora", "PT Serif", "Crimson Text", "EB Garamond",
  "Cormorant Garamond", "Bitter", "Vollkorn", "Spectral", "Source Serif 4",
  "Fira Code", "JetBrains Mono", "IBM Plex Mono", "Source Code Pro", "Space Mono",
  "Bebas Neue", "Anton", "Archivo Black", "Righteous", "Permanent Marker",
]

const loadedFonts = new Set<string>()

function loadFont(family: string, doc?: Document): void {
  if (loadedFonts.has(family)) return
  loadedFonts.add(family)
  const link = (doc ?? document).createElement("link")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`
  ;(doc ?? document).head.appendChild(link)
}

export function FontPicker({ value, onChange }: { value: string; onChange: (font: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? FONTS.filter((f) => f.toLowerCase().includes(q)) : FONTS
  }, [search])

  // Load visible fonts on open
  useEffect(() => {
    if (open) filtered.slice(0, 20).forEach((f) => loadFont(f))
  }, [open, filtered])

  const handleSelect = useCallback((font: string) => {
    loadFont(font)
    onChange(font)
    setOpen(false)
  }, [onChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-border text-[11px] hover:bg-accent/50 transition-colors w-full text-left truncate"
          style={{ fontFamily: value || "inherit" }}>
          <Type className="size-3 text-muted-foreground shrink-0" />
          <span className="truncate">{value || "Default"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 z-50" side="bottom" align="start" sideOffset={4}>
        <div className="p-2 border-b">
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fonts..." className="h-7 text-[11px]" autoFocus />
        </div>
        <div ref={listRef} className="max-h-[280px] overflow-y-auto p-1">
          {/* System fonts */}
          <button onClick={() => handleSelect("system-ui, sans-serif")}
            className="w-full text-left px-2 py-1.5 rounded text-[11px] hover:bg-accent/50 transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}>
            System Default
          </button>
          <div className="h-px bg-border my-1" />
          {filtered.map((font) => (
            <button key={font} onClick={() => handleSelect(font)}
              className={`w-full text-left px-2 py-1.5 rounded text-[12px] hover:bg-accent/50 transition-colors truncate ${value === font ? "bg-accent font-medium" : ""}`}
              style={{ fontFamily: `"${font}", sans-serif` }}
              onMouseEnter={() => loadFont(font)}>
              {font}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-[10px] text-muted-foreground text-center py-4">No fonts found</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { loadFont }
