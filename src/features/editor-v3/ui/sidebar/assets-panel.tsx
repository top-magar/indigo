"use client"
import { useCallback, useRef } from "react"
import { Upload, Trash2, ImageIcon } from "lucide-react"
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
        img.onload = () => {
          useEditorV3Store.getState().addAsset(file.name, "image", src, img.naturalWidth, img.naturalHeight)
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }, [])

  const insertAsset = useCallback((assetId: string, src: string, name: string) => {
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
    <div className="p-3">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
        <Upload className="w-3.5 h-3.5" /> Upload Images
      </button>

      {assets.length === 0 ? (
        <div className="mt-6 text-center text-xs text-gray-400">No assets yet</div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative border rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400"
              onClick={() => insertAsset(asset.id, asset.src, asset.name)}>
              {asset.type === "image" ? (
                <img src={asset.src} alt={asset.name} className="w-full h-20 object-cover" />
              ) : (
                <div className="w-full h-20 flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="px-1.5 py-1 text-[10px] text-gray-600 truncate">{asset.name}</div>
              <button onClick={(e) => { e.stopPropagation(); useEditorV3Store.getState().removeAsset(asset.id) }}
                className="absolute top-1 right-1 p-0.5 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
              {asset.width && <div className="absolute bottom-6 right-1 text-[8px] bg-black/50 text-white px-1 rounded">{asset.width}×{asset.height}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
