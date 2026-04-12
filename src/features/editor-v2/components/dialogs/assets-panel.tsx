"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Copy } from "lucide-react"

const STORAGE_KEY = "editor-v2-assets"

function getAssets(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
}

function saveAssets(urls: string[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(urls)) }

export function AssetsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [assets, setAssets] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) setAssets(getAssets()) }, [open])

  const upload = async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    if (!res.ok) return
    const { url } = await res.json()
    const next = [url, ...assets]
    saveAssets(next)
    setAssets(next)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Assets</DialogTitle></DialogHeader>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]) }} />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</Button>
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {assets.map((url) => (
            <div key={url} className="relative group cursor-pointer" draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", url)} onClick={() => navigator.clipboard.writeText(url)}>
              <img src={url} alt="" className="w-full h-20 object-cover rounded border" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                <Copy className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[8px] text-muted-foreground truncate block">{url.split("/").pop()}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
