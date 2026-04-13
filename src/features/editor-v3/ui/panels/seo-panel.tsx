"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "../use-store"

function CharCount({ count, max }: { count: number; max: number }) {
  const color = count === 0 ? "text-muted-foreground/40" : count > max ? "text-destructive" : count > max * 0.8 ? "text-amber-500" : "text-emerald-600"
  return <div className={`text-[9px] mt-0.5 ${color}`}>{count}/{max}</div>
}

export function SeoPanel() {
  const s = useStore()
  const page = s.currentPageId ? s.pages.get(s.currentPageId) : undefined
  if (!page) return <div className="p-4 text-center text-[11px] text-muted-foreground">No page selected</div>

  const update = (patch: Record<string, string>) => s.updatePage(page.id, patch)
  const titleLen = (page.title ?? "").length
  const descLen = (page.description ?? "").length

  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">SEO — {page.name}</div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Page Title</label>
          <Input value={page.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder={page.name} className="h-7 text-[11px]" />
          <CharCount count={titleLen} max={60} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Meta Description</label>
          <Textarea value={page.description ?? ""} onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe this page for search engines..." rows={3}
            className="text-[11px] min-h-[60px] resize-none" />
          <CharCount count={descLen} max={160} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">OG Image URL</label>
          <Input value={page.ogImage ?? ""} onChange={(e) => update({ ogImage: e.target.value })} placeholder="https://..." className="h-7 text-[11px]" />
          {page.ogImage && (
            <div className="mt-1.5 rounded border overflow-hidden aspect-[1200/630] bg-muted">
              <img src={page.ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}
        </div>
      </div>
      <div className="border-t mt-3 pt-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 font-medium">Code Injection</div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Head Code</label>
            <Textarea value={(page as unknown as Record<string, string>).headCode ?? ""} onChange={(e) => update({ headCode: e.target.value })}
              placeholder="<script>, <link>, <meta> tags..." rows={3}
              className="text-[11px] font-mono min-h-[60px] resize-y" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Body Code</label>
            <Textarea value={(page as unknown as Record<string, string>).bodyCode ?? ""} onChange={(e) => update({ bodyCode: e.target.value })}
              placeholder="Analytics scripts, chat widgets..." rows={3}
              className="text-[11px] font-mono min-h-[60px] resize-y" />
          </div>
        </div>
      </div>
    </div>
  )
}
