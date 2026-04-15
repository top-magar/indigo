"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SectionConfig } from "@/features/store/section-registry"
import { DEFAULT_SECTIONS } from "@/features/store/section-registry"
import { saveSections } from "./actions"
import { LexicalSectionEditor } from "@/features/store/builder/editor"

export function SectionBuilder({ initialSections, storeSlug }: { initialSections: SectionConfig[]; storeSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [sections, setSections] = useState<SectionConfig[]>(
    initialSections.length > 0 ? initialSections : DEFAULT_SECTIONS
  )

  const handleChange = useCallback((updated: SectionConfig[]) => {
    setSections(updated)
  }, [])

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveSections(sections)
      if (result.error) toast.error(result.error)
      else { toast.success("Store layout published!"); router.refresh() }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Store Sections</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag to reorder, click to edit. Undo/redo with Ctrl+Z / Ctrl+Shift+Z.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {storeSlug && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1.5" />
                View Store
              </a>
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Saving…</> : "Save & Publish"}
          </Button>
        </div>
      </div>

      <LexicalSectionEditor
        initialSections={sections}
        onChange={handleChange}
      />
    </div>
  )
}
