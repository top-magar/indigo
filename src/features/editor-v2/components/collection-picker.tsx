"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEditorV2Context } from "../editor-context"
import { fetchCollectionsAction } from "../actions"

export interface PickedCollection {
  id: string
  name: string
  slug: string
  image: string
}

interface CollectionPickerProps {
  onSelect: (collection: PickedCollection) => void
  trigger?: React.ReactNode
}

export function CollectionPicker({ onSelect, trigger }: CollectionPickerProps) {
  const { tenantId } = useEditorV2Context()
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<{ id: string; name: string; slug: string; description: string | null; image_url: string | null }[]>([])

  useEffect(() => {
    if (!open || !tenantId) return
    fetchCollectionsAction(tenantId).then((res) => { if (res.success) setCollections(res.collections) })
  }, [open, tenantId])

  const pick = (c: typeof collections[number]) => {
    onSelect({ id: c.id, name: c.name, slug: c.slug, image: c.image_url ?? "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline" size="sm" className="h-7 text-xs w-full">Select Collection</Button>}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[60vh] flex flex-col">
        <DialogHeader><DialogTitle className="text-sm">Pick a Collection</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-1">
          {collections.map((c) => (
            <button key={c.id} onClick={() => pick(c)} className="flex items-center gap-2 w-full p-2 rounded hover:bg-muted text-left text-xs">
              {c.image_url && <img src={c.image_url} alt="" className="h-8 w-8 rounded object-cover shrink-0" />}
              <span className="flex-1 truncate">{c.name}</span>
            </button>
          ))}
          {collections.length === 0 && <p className="text-xs text-muted-foreground p-2">No collections found</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
