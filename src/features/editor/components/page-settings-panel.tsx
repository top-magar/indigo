"use client"

import { useState, useTransition } from "react"
import { FileText, Search, Globe, Save } from "lucide-react"
import { SeoPanel } from "./seo-panel"
import { GlobalSectionsPanel } from "./global-sections-panel"
import { saveAsTemplateAction } from "../actions"
import { useEditor } from "@craftjs/core"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from "lucide-react"

interface PageSettingsPanelProps { tenantId: string; seoInitial: { title: string; description: string; ogImage: string }; pageId: string | null }

export function PageSettingsPanel({ tenantId, seoInitial, pageId }: PageSettingsPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: 'var(--editor-text)' }}>
      <div className="flex items-center gap-2 h-11 px-3 shrink-0 border-b" style={{ borderColor: 'var(--editor-border)' }}>
        <FileText className="w-4 h-4" style={{ color: 'var(--editor-icon-secondary)' }} />
        <span className="text-[13px] font-semibold">Page Settings</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2 text-xs" style={{ color: 'var(--editor-text-disabled)' }}>
          Select a block on the canvas to edit its properties.
        </div>

        <PageSection icon={Search} title="SEO" defaultOpen>
          <SeoPanel tenantId={tenantId} initial={seoInitial} pageId={pageId} />
        </PageSection>

        <PageSection icon={Globe} title="Global Sections">
          <GlobalSectionsPanel tenantId={tenantId} />
        </PageSection>

        <PageSection icon={Save} title="Save as Template">
          <SaveAsTemplate tenantId={tenantId} />
        </PageSection>
      </ScrollArea>
    </div>
  )
}

function PageSection({ icon: Icon, title, defaultOpen, children }: { icon: typeof Search; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Separator />
      <CollapsibleTrigger className="flex items-center gap-1 w-full h-9 px-3 text-xs font-semibold bg-transparent border-none cursor-pointer hover:bg-muted/50 transition-colors" style={{ color: 'var(--editor-text)' }}>
        {open ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--editor-icon-secondary)' }} /> : <ChevronRight className="w-3 h-3" style={{ color: 'var(--editor-icon-secondary)' }} />}
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--editor-icon-secondary)' }} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

function SaveAsTemplate({ tenantId }: { tenantId: string }) {
  const [name, setName] = useState("")
  const [saving, startSave] = useTransition()
  const { query } = useEditor()

  const handleSave = () => {
    if (!name.trim()) return
    const json = query.serialize()
    startSave(async () => {
      const res = await saveAsTemplateAction(tenantId, name.trim(), json)
      if (res.success) { toast.success("Template saved"); setName("") }
      else toast.error(res.error || "Failed to save")
    })
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs" style={{ color: 'var(--editor-text-secondary)' }}>Save the current page layout as a reusable template.</p>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name…" className="h-8 text-[13px]" onKeyDown={(e) => { if (e.key === "Enter") handleSave() }} />
      <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full h-8 text-[13px]">
        {saving ? "Saving…" : "Save Template"}
      </Button>
    </div>
  )
}
