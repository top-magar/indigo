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
        className="w-full flex flex-col items-center justify-center gap-1 px-3 py-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer group">
        <Upload className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
        <span className="text-[11px] text-gray-400 group-hover:text-blue-500 transition-colors">Upload images</span>
      </button>

      {assets.length === 0 ? (
        <div className="mt-6 text-center text-[11px] text-gray-300">No assets yet</div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative rounded-md overflow-hidden border border-gray-100 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => insertAsset(asset.src, asset.name)}>
              {asset.type === "image" ? (
                <img src={asset.src} alt={asset.name} className="w-full h-20 object-cover" />
              ) : (
                <div className="w-full h-20 flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-5 h-5 text-gray-200" />
                </div>
              )}
              <div className="px-1.5 py-1 text-[9px] text-gray-500 truncate">{asset.name}</div>
              <button onClick={(e) => { e.stopPropagation(); useEditorV3Store.getState().removeAsset(asset.id) }}
                className="absolute top-1 right-1 p-0.5 bg-white/90 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Trash2 className="w-2.5 h-2.5 text-red-400" />
              </button>
              {asset.width && <div className="absolute bottom-7 right-1 text-[8px] bg-black/50 text-white px-1 rounded">{asset.width}×{asset.height}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
