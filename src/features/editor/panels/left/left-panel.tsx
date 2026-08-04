"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/shared/utils"
import { useEditor } from "../../core/provider"
import { useEditorStore } from "../../core/editor-store"
import {
  createPage,
  deletePage2,
  getProjectPages,
  reorderProjectPages,
  setHomepage,
  setPageVisibility,
  updatePage,
} from "../../lib/queries"
import { MIcon } from "../../ui/m-icon"

type PageItem = Awaited<ReturnType<typeof getProjectPages>>[number]

type LeftPanelProps = {
  onPageChange?: (page: { id: string; name: string; slug?: string; data: string | null; serverRevision?: number }) => void
  onAddSection?: () => void
}

function IconButton({ label, icon, onClick, disabled }: { label: string; icon: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground disabled:opacity-30">
          <MIcon name={icon} size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function LeftPanel({ onPageChange, onAddSection }: LeftPanelProps) {
  const { pageId, state, dispatch } = useEditor()
  const activePageId = useEditorStore((store) => store.currentPageId)
  const [pages, setPages] = useState<PageItem[]>([])
  const [creating, setCreating] = useState(false)
  const [newPageName, setNewPageName] = useState("")
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const body = state.editor.elements[0]
  const sections = body && Array.isArray(body.content) ? body.content : []

  const handleGlobalSection = (type: "header" | "footer") => {
    // Placeholder for global section selection
  };

  const loadPages = useCallback(async () => {
    setPages(await getProjectPages(pageId))
  }, [pageId])

  useEffect(() => {
    let cancelled = false
    getProjectPages(pageId).then((result) => {
      if (!cancelled) setPages(result)
    })
    return () => { cancelled = true }
  }, [pageId])

  const selectPage = (page: PageItem) => {
    onPageChange?.({
      id: page.id,
      name: page.name,
      slug: page.slug,
      data: JSON.stringify(page.data),
      serverRevision: page.serverRevision,
    })
  }

  const addPage = async () => {
    const name = newPageName.trim()
    if (!name) return
    const page = await createPage(pageId, name)
    if (!page) return
    setNewPageName("")
    setCreating(false)
    await loadPages()
    selectPage(page)
  }

  const movePage = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= pages.length) return
    const next = [...pages]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setPages(next)
    await reorderProjectPages(pageId, next.map((page) => page.id))
  }

  const updateVisibility = async (page: PageItem) => {
    const visible = !page.visible
    setPages((current) => current.map((item) => item.id === page.id ? { ...item, visible } : item))
    await setPageVisibility(page.id, visible)
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground max-lg:w-64" aria-label="Site navigator">
      <div className="flex h-11 items-center justify-between border-b border-sidebar-border px-3">
        <h2 className="text-sm font-semibold">Site</h2>
        <IconButton label="Create page" icon="add" onClick={() => setCreating(true)} />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-1 px-2 py-1 text-xs font-medium text-muted-foreground">Global sections</div>
        <button type="button" onClick={() => handleGlobalSection("header")} className={cn("flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-sidebar-accent", activePageId === "header" && "bg-sidebar-accent text-sidebar-accent-foreground")}>
          <MIcon name="web_asset" size={15} className="text-muted-foreground" />
          <span className="flex-1">Header</span>
          <span className="text-xs text-muted-foreground">Global</span>
        </button>

        <div className="mt-4 flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-muted-foreground">Pages</span>
          <span className="text-xs tabular-nums text-muted-foreground">{pages.length}</span>
        </div>
        {creating && (
          <form className="mb-2 flex gap-1 px-1" onSubmit={(event) => { event.preventDefault(); void addPage() }}>
            <Input autoFocus value={newPageName} onChange={(event) => setNewPageName(event.target.value)} placeholder="Page name" className="h-8 text-xs" />
            <IconButton label="Add page" icon="check" onClick={() => void addPage()} disabled={!newPageName.trim()} />
          </form>
        )}
        <div className="space-y-0.5">
          {pages.map((page, index) => (
            <div key={page.id}>
              <div className={cn("group flex min-h-9 items-center rounded-md", activePageId === page.id && "bg-sidebar-accent text-sidebar-accent-foreground")}>
                <button type="button" onClick={() => selectPage(page)} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <MIcon name={page.isHomepage ? "home" : "description"} size={14} className="shrink-0 text-muted-foreground" />
                  <span className="truncate">{page.name}</span>
                </button>
                <button type="button" aria-label={page.visible ? `Hide ${page.name}` : `Show ${page.name}`} onClick={() => void updateVisibility(page)} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                  <MIcon name={page.visible ? "visibility" : "visibility_off"} size={13} />
                </button>
                <button type="button" aria-label={`Settings for ${page.name}`} onClick={() => setSettingsId(settingsId === page.id ? null : page.id)} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                  <MIcon name="more_horiz" size={14} />
                </button>
              </div>
              {settingsId === page.id && (
                <div className="mb-2 ml-6 space-y-2 border-l pl-3 pr-1 py-2">
                  <label className="block text-xs text-muted-foreground">
                    Page name
                    <Input defaultValue={page.name} onBlur={(event) => {
                      const name = event.target.value.trim()
                      if (name && name !== page.name) void updatePage(page.id, { name }).then(loadPages)
                    }} className="mt-1 h-8 text-xs" />
                  </label>
                  <div className="flex items-center gap-1">
                    <IconButton label="Move page up" icon="arrow_upward" onClick={() => void movePage(index, -1)} disabled={index === 0} />
                    <IconButton label="Move page down" icon="arrow_downward" onClick={() => void movePage(index, 1)} disabled={index === pages.length - 1} />
                    {!page.isHomepage && <button type="button" onClick={() => void setHomepage(pageId, page.id).then(loadPages)} className="h-8 rounded-md px-2 text-xs hover:bg-sidebar-accent">Set home</button>}
                    {pages.length > 1 && <IconButton label={`Delete ${page.name}`} icon="delete" onClick={() => void deletePage2(page.id).then(loadPages)} />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-muted-foreground">Sections on this page</span>
          <span className="text-xs tabular-nums text-muted-foreground">{sections.length}</span>
        </div>
        <div className="space-y-0.5">
          {sections.map((section, index) => (
            <div key={section.id} className={cn("group flex min-h-9 items-center rounded-md", state.editor.selected?.id === section.id && "bg-sidebar-accent text-sidebar-accent-foreground")}>
              <button type="button" onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: section } })} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <MIcon name="drag_indicator" size={14} className="text-muted-foreground" />
                <span className="truncate">{section.name}</span>
              </button>
              <button type="button" aria-label={section.hidden ? `Show ${section.name}` : `Hide ${section.name}`} onClick={() => dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...section, hidden: !section.hidden } } })} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                <MIcon name={section.hidden ? "visibility_off" : "visibility"} size={13} />
              </button>
              <button type="button" aria-label={`Move ${section.name} up`} disabled={index === 0} onClick={() => dispatch({ type: "REORDER_ELEMENT", payload: { elId: section.id, direction: "up" } })} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-20">
                <MIcon name="arrow_upward" size={13} />
              </button>
              <button type="button" aria-label={`Move ${section.name} down`} disabled={index === sections.length - 1} onClick={() => dispatch({ type: "REORDER_ELEMENT", payload: { elId: section.id, direction: "down" } })} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-20">
                <MIcon name="arrow_downward" size={13} />
              </button>
            </div>
          ))}
          {sections.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">This page has no sections yet.</p>}
        </div>
        <button type="button" onClick={onAddSection} className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed text-sm font-medium hover:border-primary/50 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MIcon name="add" size={15} /> Add section
        </button>

        <button type="button" onClick={() => handleGlobalSection("footer")} className={cn("mt-4 flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-sidebar-accent", activePageId === "footer" && "bg-sidebar-accent text-sidebar-accent-foreground")}>
          <MIcon name="call_to_action" size={15} className="text-muted-foreground" />
          <span className="flex-1">Footer</span>
          <span className="text-xs text-muted-foreground">Global</span>
        </button>
      </div>
    </aside>
  )
}
