"use client"

import { useState } from "react"
import { cn } from "@/shared/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway",
  "Playfair Display", "Merriweather", "Lora", "Nunito", "Source Sans 3", "PT Sans",
  "Oswald", "Noto Sans", "Ubuntu", "Rubik", "Work Sans", "DM Sans", "Outfit",
  "Space Grotesk", "Sora", "Manrope", "Plus Jakarta Sans", "Crimson Text",
  "Libre Baskerville", "EB Garamond", "Cormorant Garamond", "Bitter", "Josefin Sans",
] as const

export function FontPicker({ value, onChange }: { value: string; onChange: (f: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const filtered = FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 text-[10px] w-full justify-start" style={{ fontFamily: `"${value}", sans-serif` }}>
          {value || "Select font..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fonts..." className="h-7 text-xs" autoFocus />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.map(f => (
            <button
              key={f}
              onClick={() => { onChange(f); setOpen(false); setSearch("") }}
              className={cn("w-full text-left px-3 py-1.5 text-sm hover:bg-accent", value === f && "bg-accent font-medium")}
              style={{ fontFamily: `"${f}", sans-serif` }}
            >
              {f}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
