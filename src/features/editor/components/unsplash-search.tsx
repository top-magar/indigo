"use client"

import { useState, useCallback, useRef } from "react"
import { Search, Loader2, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface UnsplashPhoto {
  id: string
  urls: { small: string; regular: string }
  alt_description: string | null
  user: { name: string; links: { html: string } }
}

interface UnsplashSearchProps {
  onSelect: (url: string) => void
}

export function UnsplashSearch({ onSelect }: UnsplashSearchProps) {
  const [query, setQuery] = useState("")
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setPhotos([]); return }

    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    if (!key) {
      setError("Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${key}` } }
      )
      if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`)
      const data = await res.json()
      setPhotos(data.results || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 500)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search free photos…"
          className="h-8 pl-7 text-[11px]"
        />
      </div>

      {error && <p className="text-[10px] text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 max-h-[200px] overflow-y-auto">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => onSelect(photo.urls.regular)}
              className="group relative aspect-video overflow-hidden rounded border border-border/50 hover:ring-2 hover:ring-primary"
              title={`Photo by ${photo.user.name}`}
            >
              <img
                src={photo.urls.small}
                alt={photo.alt_description || ""}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[8px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {photo.user.name}
              </span>
            </button>
          ))}
        </div>
      ) : query && !loading ? (
        <div className="flex flex-col items-center py-4 text-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
          <p className="mt-1 text-[10px] text-muted-foreground">No results</p>
        </div>
      ) : null}

      {photos.length > 0 && (
        <p className="text-center text-[9px] text-muted-foreground/50">
          Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
        </p>
      )}
    </div>
  )
}
