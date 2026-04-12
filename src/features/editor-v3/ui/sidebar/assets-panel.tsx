"use client"
import { useCallback, useRef } from "react"
import { Upload, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

export function AssetsPanel() {
  const s = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const assets = [...s.assets.values()]

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result as string
        const img = new window.Image()
        img.onload = () => { useEditorV3Store.getState().addAsset(file.name, "image", src, img.naturalWidth, img.naturalHeight) }
        img.src = src
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }, [])

  const insertAsset = useCallback((src: string, name: string) => {
    const st = useEditorV3Store.getState()
    const page = st.currentPageId ? st.pages.get(st.currentPageId) : undefined
    if (!page) return
    const parent = st.selectedInstanceId ?? page.rootInstanceId
    const parentInst = st.instances.get(parent)
    const id = st.addInstance(parent, parentInst?.children.length ?? 0, "Image")
    st.setProp(id, "src", "string", src)
    st.setProp(id, "alt", "string", name)
    st.select(id)
  }, [])

  return (
    <div className="p-2 overflow-y-auto">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full flex flex-col items-center justify-center gap-1 px-3 py-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer group">
        <Upload className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">Upload images</span>
      </button>

      {assets.length === 0 ? (
        <div className="mt-6 text-center text-[11px] text-muted-foreground/50">No assets yet</div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative rounded-md overflow-hidden border hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => insertAsset(asset.src, asset.name)}>
              {asset.type === "image" ? (
                <img src={asset.src} alt={asset.name} className="w-full h-20 object-cover" />
              ) : (
                <div className="w-full h-20 flex items-center justify-center bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground/30" />
                </div>
              )}
              <div className="px-1.5 py-1 text-[9px] text-muted-foreground truncate">{asset.name}</div>
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 size-5 bg-background/80 opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); useEditorV3Store.getState().removeAsset(asset.id) }}>
                <Trash2 className="size-2.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
