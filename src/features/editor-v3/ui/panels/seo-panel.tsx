"use client"
import { useStore } from "../use-store"

export function SeoPanel() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return <div className="p-3 text-xs text-gray-400">No page selected</div>

  const update = (patch: Record<string, string>) => s.updatePage(page.id, patch)

  return (
    <div className="p-3 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">SEO — {page.name}</div>
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Page Title</label>
          <input value={page.title ?? ""} onChange={(e) => update({ title: e.target.value })}
            placeholder={page.name} className="w-full px-2 py-1 text-xs border rounded" />
          <div className="text-[9px] text-gray-400 mt-0.5">{(page.title ?? page.name).length}/60</div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Meta Description</label>
          <textarea value={page.description ?? ""} onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe this page for search engines..." rows={3}
            className="w-full px-2 py-1 text-xs border rounded resize-none" />
          <div className="text-[9px] text-gray-400 mt-0.5">{(page.description ?? "").length}/160</div>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">OG Image URL</label>
          <input value={page.ogImage ?? ""} onChange={(e) => update({ ogImage: e.target.value })}
            placeholder="https://..." className="w-full px-2 py-1 text-xs border rounded" />
        </div>
      </div>
    </div>
  )
}
