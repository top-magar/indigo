"use client"

import { useState, useCallback, useRef } from "react"
import { Search, Loader2, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UnsplashPhoto { id: string; urls: { small: string; regular: string }; alt_description: string | null; user: { name: string; links: { html: string } } }

export function UnsplashSearch({ onSelect }: { onSelect: (url: string) => void }) {
  const [query, setQuery] = useState("")
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setPhotos([]); return }
    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    if (!key) { setError("Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`, { headers: { Authorization: `Client-ID ${key}` } })
      if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`)
      setPhotos((await res.json()).results || [])
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed") }
    finally { setLoading(false) }
  }, [])

  const handleInput = (value: string) => { setQuery(value); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => search(value), 500) }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--editor-icon-secondary)' }} />
        <Input value={query} onChange={(e) => handleInput(e.target.value)} placeholder="Search free photos…" className="h-8 pl-7 text-xs" />
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--editor-icon-secondary)' }} /></div>
      ) : photos.length > 0 ? (
        <ScrollArea className="max-h-[200px]">
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo) => (
              <button key={photo.id} onClick={() => onSelect(photo.urls.regular)} title={`Photo by ${photo.user.name}`}
                className="relative aspect-video overflow-hidden rounded-md border p-0 bg-transparent cursor-pointer transition-all hover:border-[var(--editor-accent)] hover:shadow-[0_0_0_1px_var(--editor-accent)]"
                style={{ borderColor: 'var(--editor-border)' }}>
                <img src={photo.urls.small} alt={photo.alt_description || ""} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : query && !loading ? (
        <div className="flex flex-col items-center py-4 text-center">
          <ImageIcon className="h-5 w-5" style={{ color: 'var(--editor-text-disabled)' }} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--editor-text-secondary)' }}>No results</p>
        </div>
      ) : null}

      {photos.length > 0 && (
        <p className="text-center text-[10px]" style={{ color: 'var(--editor-text-disabled)' }}>
          Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
        </p>
      )}
    </div>
  )
}
