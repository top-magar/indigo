"use client"

import "../blocks"
import { useEffect, useCallback, useRef, useState, useTransition } from "react"
import { ChevronLeft, Undo2, Redo2, Save, Eye, Monitor, Tablet, Smartphone, Globe, Loader2, X, Sun, Moon, Grid } from "lucide-react"
import { useEditorStore, type Section } from "../store"
import { saveSectionsAction, publishSectionsAction, fetchUpdatedAtAction } from "../actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/shared/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { SettingsPanel } from "./settings-panel"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { SelectionBreadcrumb } from "./breadcrumb"
import { VersionHistory } from "./version-history"
import { EditorV2Provider } from "../editor-context"
import { AutosaveIndicator } from "./autosave-indicator"
import { HistoryPanel } from "./history-panel"
import { CommandPalette } from "./command-palette"
import { FindReplace } from "./find-replace"
import { ShortcutsDialog } from "./shortcuts-dialog"
import { ResizeHandle } from "./resize-handle"
import { A11yPanel } from "./a11y-panel"
import { AssetsPanel } from "./assets-panel"
import Link from "next/link"

interface EditorShellProps {
  tenantId: string
  pageId: string
  pageName?: string
  initialSections: Section[]
  initialTheme?: Record<string, unknown>
  initialUpdatedAt?: string
  seoInitial?: { title: string; description: string; ogImage: string }
}

export function EditorShell({ tenantId, pageId, pageName, initialSections, initialTheme, initialUpdatedAt, seoInitial }: EditorShellProps) {
  const { sections, selectedId, dirty, viewport, previewMode, theme, panelsMinimized, loadSections, updateTheme, markClean, setViewport, setPreviewMode, selectSection, togglePanels, showGrid, toggleGrid } = useEditorStore()
  const loaded = useRef(false)
  const saveRef = useRef<() => Promise<void>>(undefined)
  const [publishing, startPublish] = useTransition()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [leftWidth, setLeftWidth] = useState(240)
  const [rightWidth, setRightWidth] = useState(280)
  const updatedAtRef = useRef(initialUpdatedAt)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'retrying'>('idle')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('editor-theme') === 'dark'
    return false
  })

  const draftKey = `editor-v2-draft-${pageId}`

  useEffect(() => {
    if (!loaded.current) {
      // Check for localStorage draft before loading initial data
      try {
        const raw = localStorage.getItem(draftKey)
        if (raw) {
          const draft = JSON.parse(raw) as { sections: Section[]; theme: Record<string, unknown>; timestamp: number }
          const initialTime = initialUpdatedAt ? new Date(initialUpdatedAt).getTime() : 0
          if (draft.timestamp > initialTime) {
            toast("Unsaved draft found", {
              duration: 15000,
              action: { label: "Restore", onClick: () => { loadSections(draft.sections); if (draft.theme) updateTheme(draft.theme); useEditorStore.setState({ dirty: true }) } },
              cancel: { label: "Discard", onClick: () => localStorage.removeItem(draftKey) },
            })
          } else {
            localStorage.removeItem(draftKey)
          }
        }
      } catch { /* corrupt draft, ignore */ }

      loadSections(initialSections)
      if (initialTheme) updateTheme(initialTheme)
      loaded.current = true
    }
  }, [initialSections, initialTheme, initialUpdatedAt, loadSections, updateTheme, draftKey])

  // Draft persistence — debounce 1s, write sections+theme to localStorage
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsub = useEditorStore.subscribe((state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          localStorage.setItem(draftKey, JSON.stringify({ sections: state.sections, theme: state.theme, timestamp: Date.now() }))
        } catch { /* quota exceeded, ignore */ }
      }, 1000)
    })
    return () => { unsub(); clearTimeout(timer) }
  }, [draftKey])

  // Dark mode — toggle class on <html> + persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('editor-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const save = useCallback(async () => {
    const DELAYS = [0, 1000, 3000]
    const state = useEditorStore.getState()

    // Conflict detection — check server updated_at before saving
    const serverCheck = await fetchUpdatedAtAction(tenantId, pageId)
    if (serverCheck.updatedAt && updatedAtRef.current && new Date(serverCheck.updatedAt).getTime() > new Date(updatedAtRef.current).getTime()) {
      toast.error("Someone else edited this page", {
        duration: 10000,
        action: { label: "Overwrite", onClick: () => { updatedAtRef.current = serverCheck.updatedAt!; save() } },
        cancel: { label: "Reload", onClick: () => window.location.reload() },
      })
      return
    }

    for (let attempt = 0; attempt < DELAYS.length; attempt++) {
      if (attempt > 0) {
        setSaveStatus('retrying')
        toast.info(`Retrying save (${attempt}/${DELAYS.length - 1})...`)
        await new Promise((r) => setTimeout(r, DELAYS[attempt]))
      } else {
        setSaveStatus('saving')
      }

      const result = await saveSectionsAction(tenantId, pageId, state.sections, state.theme)
      if (result.success) {
        markClean()
        if (result.updatedAt) updatedAtRef.current = result.updatedAt
        localStorage.removeItem(draftKey)
        setSaveStatus('saved')
        return
      }

      if (attempt === DELAYS.length - 1) {
        // Final failure — emergency backup to localStorage
        try { localStorage.setItem(draftKey, JSON.stringify({ sections: state.sections, theme: state.theme, timestamp: Date.now() })) } catch {}
        toast.error(`Save failed after ${DELAYS.length} attempts. Draft saved locally.`)
        setSaveStatus('error')
      }
    }
  }, [tenantId, pageId, markClean, draftKey])

  saveRef.current = save

  // Autosave
  useEffect(() => {
    const timer = setInterval(() => { if (useEditorStore.getState().dirty) saveRef.current?.() }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Beacon save on tab close
  useEffect(() => {
    const handler = () => {
      if (useEditorStore.getState().dirty) {
        const s = useEditorStore.getState()
        navigator.sendBeacon?.("/api/editor/save", JSON.stringify({ tenantId, pageId, sections: s.sections, theme: s.theme, _v2: true }))
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [tenantId, pageId])

  // ⌘K command palette + Shift+\ toggle panels
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((v) => !v) }
      if (e.shiftKey && e.key === "\\") { e.preventDefault(); togglePanels() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [togglePanels])

  const publish = () => startPublish(async () => {
    await save()
    const result = await publishSectionsAction(tenantId, pageId)
    if (result.success) toast.success("Published!")
    else toast.error(`Publish failed: ${result.error}`)
  })

  const undo = () => useEditorStore.temporal.getState().undo()
  const redo = () => useEditorStore.temporal.getState().redo()
  const togglePreview = () => window.open('/editor-v2/preview', '_blank')

  const showPanels = !panelsMinimized

  return (
    <EditorV2Provider value={{ tenantId, pageId }}>
      <KeyboardShortcuts onSave={save} onFind={() => setFindOpen((v) => !v)} onShortcuts={() => setShortcutsOpen(true)} />

      <div className="flex h-screen overflow-hidden overscroll-none">
        {/* LEFT PANEL — 240px */}
        <aside style={showPanels ? { width: leftWidth } : undefined} className={`shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 ${showPanels ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          {/* Page name + autosave header */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" asChild><Link href="/dashboard"><ChevronLeft className="h-3.5 w-3.5" /></Link></Button></TooltipTrigger><TooltipContent>Back to Dashboard</TooltipContent></Tooltip>
            <span className="text-xs font-bold truncate flex-1">{pageName || "Untitled Page"}</span>
            <AutosaveIndicator />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <Sidebar />
          </div>
        </aside>
        {showPanels && <ResizeHandle onResize={(d) => setLeftWidth((w) => Math.min(400, Math.max(180, w + d)))} />}

        {/* CENTER — Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {findOpen && <FindReplace onClose={() => setFindOpen(false)} />}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <Canvas />
          </div>
          <SelectionBreadcrumb />
        </main>

        {/* RIGHT PANEL — 280px */}
        {showPanels && selectedId && <ResizeHandle onResize={(d) => setRightWidth((w) => Math.min(450, Math.max(220, w - d)))} />}
        <aside style={(showPanels && selectedId) ? { width: rightWidth } : undefined} className={`shrink-0 border-l bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 ${(showPanels && selectedId) ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
            <span className="text-xs font-semibold">Section Settings</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectSection(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <SettingsPanel />
          </div>
        </aside>
      </div>

      {/* BOTTOM FLOATING TOOLBAR */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-xl bg-gray-900/95 backdrop-blur shadow-2xl border border-white/10 px-2 py-1.5 transition-opacity duration-200 ${panelsMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" asChild><Link href="/dashboard"><ChevronLeft className="h-3.5 w-3.5" /></Link></Button></TooltipTrigger><TooltipContent>Back</TooltipContent></Tooltip>
          <HistoryPanel><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={undo}><Undo2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Undo (⌘Z)</TooltipContent></Tooltip></HistoryPanel>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={redo}><Redo2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Redo (⌘⇧Z)</TooltipContent></Tooltip>

          <div className="w-px h-4 bg-white/20" />

          <ToggleGroup type="single" value={viewport} onValueChange={(v) => v && setViewport(v as "desktop" | "tablet" | "mobile")} variant="outline" size="default">
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="desktop" className="h-7 w-7 p-0 text-white/80 hover:text-white border-white/10"><Monitor className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Desktop</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="tablet" className="h-7 w-7 p-0 text-white/80 hover:text-white border-white/10"><Tablet className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Tablet</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="mobile" className="h-7 w-7 p-0 text-white/80 hover:text-white border-white/10"><Smartphone className="h-3.5 w-3.5" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Mobile</TooltipContent></Tooltip>
          </ToggleGroup>

          <div className="w-px h-4 bg-white/20" />

          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={togglePreview}><Eye className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Preview (⌘P)</TooltipContent></Tooltip>

          <div className="w-px h-4 bg-white/20" />

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger><TooltipContent>{darkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent></Tooltip>

          <div className="w-px h-4 bg-white/20" />

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-white/80 hover:text-white hover:bg-white/10", showGrid && "text-blue-400")} onClick={toggleGrid}>
              <Grid className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger><TooltipContent>Grid ({showGrid ? 'On' : 'Off'})</TooltipContent></Tooltip>

          <div className="w-px h-4 bg-white/20" />

          <Tooltip><TooltipTrigger asChild><span><A11yPanel /></span></TooltipTrigger><TooltipContent>Accessibility (A11y)</TooltipContent></Tooltip>

          <div className="w-px h-4 bg-white/20" />

          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={save} disabled={!dirty}><Save className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent>Save (⌘S)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild>
            <Button size="icon" className="h-7 w-7" onClick={publish} disabled={publishing}>
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger><TooltipContent>Publish</TooltipContent></Tooltip>
        </div>

      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} tenantId={tenantId} pageId={pageId} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onSave={save} onPublish={publish} onTogglePreview={togglePreview} onBrowseAssets={() => setAssetsOpen(true)} />
      <AssetsPanel open={assetsOpen} onClose={() => setAssetsOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </EditorV2Provider>
  )
}
