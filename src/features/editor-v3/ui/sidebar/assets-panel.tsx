"use client"
import { useCallback } from "react"
import { Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/kibo-ui/dropzone"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

export function AssetsPanel() {
  const s = useStore()
  const assets = [...s.assets.values()]

  const handleDrop = useCallback((files: File[]) => {
    for (const file of files) {
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
      <Dropzone accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] }} maxFiles={10} maxSize={10 * 1024 * 1024} onDrop={handleDrop}>
        <DropzoneContent>
          <DropzoneEmptyState />
        </DropzoneContent>
      </Dropzone>

      {assets.length === 0 ? (
        <div className="mt-4 text-center text-[11px] text-muted-foreground/50">No assets yet</div>
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
