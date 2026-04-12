"use client"
import { useStore } from "../use-store"

const INPUT = "w-full px-2 py-1.5 text-[11px] border rounded bg-white focus:ring-1 focus:ring-blue-300 focus:outline-none"

export function SeoPanel() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return null

  const update = (patch: Record<string, string>) => s.updatePage(page.id, patch)
  const titleLen = (page.title ?? page.name).length
  const descLen = (page.description ?? "").length

  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2.5 font-medium">SEO — {page.name}</div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Page Title</label>
          <input value={page.title ?? ""} onChange={(e) => update({ title: e.target.value })}
            placeholder={page.name} className={INPUT} />
          <div className={`text-[9px] mt-0.5 ${titleLen > 60 ? "text-amber-500" : "text-gray-300"}`}>{titleLen}/60</div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Meta Description</label>
          <textarea value={page.description ?? ""} onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe this page for search engines..." rows={3}
            className={`${INPUT} resize-none`} />
          <div className={`text-[9px] mt-0.5 ${descLen > 160 ? "text-amber-500" : "text-gray-300"}`}>{descLen}/160</div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">OG Image URL</label>
          <input value={page.ogImage ?? ""} onChange={(e) => update({ ogImage: e.target.value })}
            placeholder="https://..." className={INPUT} />
        </div>
      </div>
    </div>
  )
}
