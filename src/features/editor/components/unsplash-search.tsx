"use client"

import { useState, useCallback, useRef } from "react"
import { Search, Loader2, ImageIcon } from "lucide-react"

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
    if (!key) { setError("Add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to .env.local"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`, { headers: { Authorization: `Client-ID ${key}` } })
      if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`)
      const data = await res.json()
      setPhotos(data.results || [])
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed") }
    finally { setLoading(false) }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <Search className="h-3.5 w-3.5" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--editor-icon-secondary)' }} />
        <input
          value={query} onChange={(e) => handleInput(e.target.value)}
          placeholder="Search free photos…"
          style={{ width: '100%', height: 32, paddingLeft: 28, paddingRight: 8, fontSize: 12, background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)', borderRadius: 'var(--editor-radius)', color: 'var(--editor-text)', outline: 'none' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
        />
      </div>

      {error && <p style={{ fontSize: 11, color: '#c70a24' }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--editor-icon-secondary)' }} />
        </div>
      ) : photos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => onSelect(photo.urls.regular)}
              title={`Photo by ${photo.user.name}`}
              style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 6, border: '1px solid var(--editor-border)', cursor: 'pointer', padding: 0, background: 'none', transition: 'all 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--editor-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <img src={photo.urls.small} alt={photo.alt_description || ""} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            </button>
          ))}
        </div>
      ) : query && !loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', textAlign: 'center' }}>
          <ImageIcon className="h-5 w-5" style={{ color: 'var(--editor-text-disabled)' }} />
          <p style={{ marginTop: 4, fontSize: 11, color: 'var(--editor-text-secondary)' }}>No results</p>
        </div>
      ) : null}

      {photos.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--editor-text-disabled)' }}>
          Photos by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Unsplash</a>
        </p>
      )}
    </div>
  )
}
