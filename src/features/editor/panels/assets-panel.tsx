"use client"

import { useState, useEffect, useTransition, useCallback, useRef } from "react"
import { Image, Upload, Search, X, Loader2, Check } from "lucide-react"
import { getAssets, uploadAsset } from "@/app/dashboard/media/actions"
import type { MediaAsset } from "@/features/media/types"
import { toast } from "sonner"
import { PanelShell } from "./panel-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function AssetsPanel() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState("")
  const [loading, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadAssets = useCallback((query?: string) => {
    startTransition(async () => { const r = await getAssets({ search: query || undefined, fileType: "images" }); setAssets(r.assets) })
  }, [])

  useEffect(() => { loadAssets() }, [loadAssets])
  useEffect(() => { const t = setTimeout(() => loadAssets(search), 300); return () => clearTimeout(t) }, [search, loadAssets])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file)
      const r = await uploadAsset(fd)
      if (r.success) toast.success(`Uploaded "${file.name}"`)
      else toast.error(r.error || `Failed to upload "${file.name}"`)
    }
    setUploading(false); loadAssets(search)
    if (fileRef.current) fileRef.current.value = ""
  }

  const copyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.cdnUrl)
    setCopiedId(asset.id); toast.success("URL copied")
    setTimeout(() => setCopiedId(null), 1500)
  }

  const uploadBtn = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-[22px] w-[22px]" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Upload image</TooltipContent>
    </Tooltip>
  )

  return (
    <PanelShell title="Assets" icon={Image} actions={uploadBtn}>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleUpload} />

      {/* Search */}
      <div className="px-3 pb-2 relative">
        <Search className="absolute left-5 top-2 size-3.5 text-muted-foreground/60" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images…" className="h-7 pl-7 text-xs" />
        {search && (
          <Button variant="ghost" size="icon" className="absolute right-4 top-0.5 h-6 w-6" onClick={() => setSearch("")}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="px-3 pb-3">
        {loading && assets.length === 0 ? (
          <div className="flex justify-center py-6"><Loader2 className="size-5 animate-spin text-muted-foreground/60" /></div>
        ) : assets.length === 0 ? (
          <div className="text-center py-6">
            <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
            <p className="text-xs m-0 text-muted-foreground">{search ? "No results" : "No images yet"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {assets.map((asset) => (
              <div key={asset.id} onClick={() => copyUrl(asset)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyUrl(asset) } }} role="button" tabIndex={0} title={`${asset.filename}\nClick to copy URL`}
                className="relative rounded-md overflow-hidden border cursor-pointer aspect-square transition-colors hover:border-blue-600"
                style={{ background: 'var(--editor-chrome-bg, #f3f4f6)' }}>
                <img src={asset.thumbnailUrl || asset.cdnUrl} alt={asset.filename} className="w-full h-full object-cover" loading="lazy" />
                {copiedId === asset.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"><Check className="size-4" /></div>
                )}
                <div className="absolute bottom-0 inset-x-0 px-1 pb-0.5 pt-3 text-[10px] text-white truncate" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                  {asset.filename}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}
