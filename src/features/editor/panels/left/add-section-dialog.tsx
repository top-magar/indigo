"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MIcon } from "../../ui/m-icon"
import { componentGroups } from "../../core/registry"
import { useInsertElement } from "../../core/use-insert-element"
import { getSavedComponents } from "../../lib/queries"
import type { El } from "../../core/types"

type LibraryGroup = "Designed sections" | "Commerce" | "Basic elements" | "Saved components"

type LibraryItem = {
  id: string
  type: string
  label: string
  group: LibraryGroup
  icon: string
  savedElement?: El
  exampleContent?: boolean
}

const iconByGroup: Record<LibraryGroup, string> = {
  "Designed sections": "view_agenda",
  Commerce: "storefront",
  "Basic elements": "widgets",
  "Saved components": "bookmark",
}

function mappedGroup(group: string): LibraryGroup {
  if (["Sections", "Marketing", "Navigation"].includes(group)) return "Designed sections"
  if (group === "E-Commerce") return "Commerce"
  return "Basic elements"
}

export function AddSectionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("")
  const [saved, setSaved] = useState<LibraryItem[]>([])
  const insert = useInsertElement()

  useEffect(() => {
    if (!open) return
    getSavedComponents().then((items) => setSaved(items.flatMap((item) => {
      try {
        return [{ id: item.id, type: "__saved", label: item.name, group: "Saved components" as const, icon: "bookmark", savedElement: JSON.parse(item.element) as El }]
      } catch {
        return []
      }
    }))).catch(() => setSaved([]))
  }, [open])

  const items = useMemo(() => {
    const builtIn = componentGroups().flatMap((group) => group.items.map((item) => ({
      id: item.type,
      type: item.type,
      label: item.label,
      group: mappedGroup(group.label),
      icon: iconByGroup[mappedGroup(group.label)],
      exampleContent: ["Sections", "Marketing"].includes(group.label),
    })))
    const term = query.trim().toLowerCase()
    return [...builtIn, ...saved].filter((item) => !term || `${item.label} ${item.group}`.toLowerCase().includes(term))
  }, [query, saved])

  const groups: LibraryGroup[] = ["Designed sections", "Commerce", "Basic elements", "Saved components"]
  const add = (item: LibraryItem) => {
    if (insert(item.type, item.savedElement)) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">Add section</DialogTitle>
          <DialogDescription>Insert a designed section, commerce block, basic element, or saved component.</DialogDescription>
        </DialogHeader>
        <div className="border-b p-4">
          <div className="relative">
            <MIcon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the library" className="h-10 pl-9" />
          </div>
        </div>
        <div className="max-h-[58vh] overflow-y-auto px-4 pb-5">
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group)
            if (!groupItems.length) return null
            return (
              <section key={group} className="pt-5" aria-labelledby={`library-${group.replaceAll(" ", "-")}`}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <MIcon name={iconByGroup[group]} size={15} className="text-muted-foreground" />
                  <h3 id={`library-${group.replaceAll(" ", "-")}`} className="text-sm font-semibold">{group}</h3>
                  <span className="text-xs tabular-nums text-muted-foreground">{groupItems.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {groupItems.map((item) => (
                    <button
                      key={`${item.group}-${item.id}`}
                      type="button"
                      onClick={() => add(item)}
                      className="min-h-20 rounded-lg border bg-background p-3 text-left hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.exampleContent ? "Includes example content to review" : item.group}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
          {items.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No matching sections.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
