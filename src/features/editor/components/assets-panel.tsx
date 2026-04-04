"use client"

import { useState, useEffect, useTransition, useCallback, useRef } from "react"
import { Image, Upload, Search, X, Loader2, Check } from "lucide-react"
import { getAssets, uploadAsset } from "@/app/dashboard/media/actions"
import type { MediaAsset } from "@/features/media/types"
import { toast } from "sonner"

export function AssetsPanel() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState("")
  const [loading, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadAssets = useCallback((query?: string) => {
    startTransition(async () => {
      const result = await getAssets({ search: query || undefined, fileType: "images" })
      setAssets(result.assets)
    })
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])

  useEffect(() => {
    const t = setTimeout(() => loadAssets(search), 300)
    return () => clearTimeout(t)
  }, [search, loadAssets])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", file)
      const result = await uploadAsset(fd)
      if (result.success) toast.success(`Uploaded "${file.name}"`)
      else toast.error(result.error || `Failed to upload "${file.name}"`)
    }
    setUploading(false)
    loadAssets(search)
    if (fileRef.current) fileRef.current.value = ""
  }

  const copyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.cdnUrl)
    setCopiedId(asset.id)
    toast.success("URL copied")
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--editor-text)' }}>Assets</span>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Upload"
          style={{
            width: 22, height: 22, borderRadius: 4, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', cursor: 'pointer', color: 'var(--editor-icon-secondary)',
          }}
        >
          {uploading ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Upload style={{ width: 14, height: 14 }} />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />
      </div>

      {/* Search */}
      <div style={{ padding: '0 12px 8px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 20, top: 7, width: 14, height: 14, color: 'var(--editor-text-disabled)' }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search images…"
          style={{
            width: '100%', height: 28, padding: '0 8px 0 28px', fontSize: 12,
            background: 'var(--editor-input-bg)', border: '1px solid var(--editor-border)',
            borderRadius: 6, color: 'var(--editor-text)', outline: 'none',
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: 'absolute', right: 20, top: 7, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--editor-text-disabled)', padding: 0 }}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {loading && assets.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <Loader2 style={{ width: 20, height: 20, color: 'var(--editor-text-disabled)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Image style={{ width: 32, height: 32, color: 'var(--editor-text-disabled)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--editor-text-secondary)', margin: 0 }}>
              {search ? "No results" : "No images yet"}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => copyUrl(asset)}
                title={`${asset.filename}\nClick to copy URL`}
                style={{
                  position: 'relative', borderRadius: 6, overflow: 'hidden',
                  border: '1px solid var(--editor-border)', cursor: 'pointer',
                  aspectRatio: '1', background: '#f3f4f6',
                  transition: 'border-color 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--editor-accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--editor-border)' }}
              >
                <img
                  src={asset.thumbnailUrl || asset.cdnUrl}
                  alt={asset.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                {/* Copy indicator */}
                {copiedId === asset.id && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)', color: 'white',
                  }}>
                    <Check style={{ width: 20, height: 20 }} />
                  </div>
                )}
                {/* Filename */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 4px 3px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  fontSize: 10, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {asset.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
