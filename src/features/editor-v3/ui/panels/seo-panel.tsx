"use client"
import { Input } from "@/components/ui/input"
import { useStore } from "../use-store"

export function SeoPanel() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return null

  const update = (patch: Record<string, string>) => s.updatePage(page.id, patch)
  const titleLen = (page.title ?? page.name).length
  const descLen = (page.description ?? "").length

  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">SEO — {page.name}</div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Page Title</label>
          <Input value={page.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder={page.name} className="h-7 text-[11px]" />
          <div className={`text-[9px] mt-0.5 ${titleLen > 60 ? "text-amber-500" : "text-muted-foreground/40"}`}>{titleLen}/60</div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Meta Description</label>
          <textarea value={page.description ?? ""} onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe this page for search engines..." rows={3}
            className="w-full px-2 py-1.5 text-[11px] border rounded resize-none bg-background focus:ring-1 focus:ring-ring focus:outline-none" />
          <div className={`text-[9px] mt-0.5 ${descLen > 160 ? "text-amber-500" : "text-muted-foreground/40"}`}>{descLen}/160</div>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">OG Image URL</label>
          <Input value={page.ogImage ?? ""} onChange={(e) => update({ ogImage: e.target.value })} placeholder="https://..." className="h-7 text-[11px]" />
        </div>
      </div>
      <div className="border-t mt-3 pt-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">Code Injection</div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Head Code</label>
            <textarea value={(page as unknown as Record<string, string>).headCode ?? ""} onChange={(e) => update({ headCode: e.target.value })}
              placeholder="<script>, <link>, <meta> tags..." rows={3}
              className="w-full px-2 py-1.5 text-[11px] font-mono border rounded resize-y bg-background focus:ring-1 focus:ring-ring focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Body Code</label>
            <textarea value={(page as unknown as Record<string, string>).bodyCode ?? ""} onChange={(e) => update({ bodyCode: e.target.value })}
              placeholder="Analytics scripts, chat widgets..." rows={3}
              className="w-full px-2 py-1.5 text-[11px] font-mono border rounded resize-y bg-background focus:ring-1 focus:ring-ring focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
