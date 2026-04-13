"use client"
import { useCallback, useState } from "react"
import {
  Layers, Plus, Settings, Paintbrush, Palette, Monitor, Tablet, Smartphone,
  Undo2, Redo2, LayoutTemplate, Download, FolderDown, Eye, FileText,
  Image as ImageIcon, Save, FolderOpen, History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { IframeCanvas } from "../canvas/iframe-canvas"
import { Navigator } from "../sidebar/navigator"
import { ComponentsPanel } from "../sidebar/components-panel"
import { TemplatesPanel } from "../sidebar/templates-panel"
import { PagesPanel } from "../sidebar/pages-panel"
import { AssetsPanel } from "../sidebar/assets-panel"
import { SettingsPanel } from "../panels/settings-panel"
import { StylePanel } from "../panels/style-panel"
import { SeoPanel } from "../panels/seo-panel"
import { TokensPanel } from "../panels/tokens-panel"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { useKeyboardShortcuts } from "./keyboard-shortcuts"
import { useGoogleFonts } from "../hooks/use-google-fonts"
import { publishFromStore, publishAllPages } from "../../publish"
import { createZip } from "../../zip"

function ToolbarButton({ onClick, tooltip, children, variant = "ghost" }: {
  onClick: () => void; tooltip: string; children: React.ReactNode; variant?: "ghost" | "default"
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size="icon" className="h-7 w-7" onClick={onClick}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export function EditorShell({ projectId, onSaveNew, onOpen, onSaveVersion, onRestoreVersion }: {
  projectId?: string | null
  onSaveNew?: () => void
  onOpen?: () => void
  onSaveVersion?: () => void
  onRestoreVersion?: () => void
}) {
  useKeyboardShortcuts()
  const s = useStore()
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null)
  useGoogleFonts(iframeDoc)
  const onDocReady = useCallback((doc: Document) => setIframeDoc(doc), [])

  const handleExport = useCallback(() => {
    const html = publishFromStore(useEditorV3Store.getState())
    if (!html) return
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "page.html"; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleExportAll = useCallback(() => {
    const pages = publishAllPages(useEditorV3Store.getState())
    if (pages.size === 0) return
    const zip = createZip(pages)
    const url = URL.createObjectURL(zip)
    const a = document.createElement("a"); a.href = url; a.download = "site.zip"; a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handlePreview = useCallback(() => {
    const html = publishFromStore(useEditorV3Store.getState())
    if (!html) return
    const win = window.open("", "_blank")
    if (win) { win.document.write(html); win.document.close() }
  }, [])

  const bpLabels: Record<string, string> = { "bp-large": "1440px", "bp-laptop": "1280px", "bp-base": "Desktop", "bp-tablet": "768px", "bp-mobile-land": "480px", "bp-mobile": "375px" }
  const bpLabel = bpLabels[s.currentBreakpointId] ?? "Desktop"

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-2 h-10 border-b bg-muted/30">
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().undo()} tooltip="Undo (⌘Z)"><Undo2 className="size-3.5" /></ToolbarButton>
            <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().redo()} tooltip="Redo (⌘⇧Z)"><Redo2 className="size-3.5" /></ToolbarButton>
            <Separator orientation="vertical" className="mx-1 h-4" />
            {onOpen && <ToolbarButton onClick={onOpen} tooltip="Open project"><FolderOpen className="size-3.5" /></ToolbarButton>}
            {onSaveNew && !projectId && <ToolbarButton onClick={onSaveNew} tooltip="Save to cloud"><Save className="size-3.5" /></ToolbarButton>}
            {projectId && <span className="text-[10px] text-emerald-600 font-medium ml-1">● Cloud</span>}
            {projectId && onSaveVersion && <ToolbarButton onClick={onSaveVersion} tooltip="Save version"><Save className="size-3.5 text-emerald-600" /></ToolbarButton>}
            {projectId && onRestoreVersion && <ToolbarButton onClick={onRestoreVersion} tooltip="Version history"><History className="size-3.5" /></ToolbarButton>}
          </div>

          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={s.currentBreakpointId} onValueChange={(v) => { if (v) s.setBreakpoint(v) }} size="sm" className="bg-muted rounded-md p-0.5">
              <ToggleGroupItem value="bp-large" className="h-7 px-1.5 text-[9px] data-[state=on]:bg-background data-[state=on]:shadow-sm">1440</ToggleGroupItem>
              <ToggleGroupItem value="bp-laptop" className="h-7 px-1.5 text-[9px] data-[state=on]:bg-background data-[state=on]:shadow-sm">1280</ToggleGroupItem>
              <ToggleGroupItem value="bp-base" className="h-7 w-7 data-[state=on]:bg-background data-[state=on]:shadow-sm"><Monitor className="size-3.5" /></ToggleGroupItem>
              <ToggleGroupItem value="bp-tablet" className="h-7 w-7 data-[state=on]:bg-background data-[state=on]:shadow-sm"><Tablet className="size-3.5" /></ToggleGroupItem>
              <ToggleGroupItem value="bp-mobile-land" className="h-7 px-1.5 text-[9px] data-[state=on]:bg-background data-[state=on]:shadow-sm">480</ToggleGroupItem>
              <ToggleGroupItem value="bp-mobile" className="h-7 w-7 data-[state=on]:bg-background data-[state=on]:shadow-sm"><Smartphone className="size-3.5" /></ToggleGroupItem>
            </ToggleGroup>
            <span className="text-[10px] text-muted-foreground font-medium">{bpLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleExport}><Download className="size-3.5" />Export</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleExportAll}><FolderDown className="size-3.5" />All</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handlePreview}><Eye className="size-3.5" />Preview</Button>
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <SelectionBreadcrumb />

        {/* ── Main area ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left sidebar ── */}
          <Tabs defaultValue="navigator" className="w-[252px] border-r flex flex-col !gap-0">
            <TabsList variant="line" className="w-full justify-start rounded-none border-b px-1 h-9 shrink-0">
              <TabsTrigger value="navigator" className="h-7 w-7 p-0"><Tooltip><TooltipTrigger asChild><span><Layers className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">Navigator</TooltipContent></Tooltip></TabsTrigger>
              <TabsTrigger value="add" className="h-7 w-7 p-0"><Tooltip><TooltipTrigger asChild><span><Plus className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">Add</TooltipContent></Tooltip></TabsTrigger>
              <TabsTrigger value="blocks" className="h-7 w-7 p-0"><Tooltip><TooltipTrigger asChild><span><LayoutTemplate className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">Blocks</TooltipContent></Tooltip></TabsTrigger>
              <TabsTrigger value="pages" className="h-7 w-7 p-0"><Tooltip><TooltipTrigger asChild><span><FileText className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">Pages</TooltipContent></Tooltip></TabsTrigger>
              <TabsTrigger value="assets" className="h-7 w-7 p-0"><Tooltip><TooltipTrigger asChild><span><ImageIcon className="size-4" /></span></TooltipTrigger><TooltipContent side="bottom">Assets</TooltipContent></Tooltip></TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="navigator" className="mt-0"><Navigator /></TabsContent>
              <TabsContent value="add" className="mt-0"><ComponentsPanel /></TabsContent>
              <TabsContent value="blocks" className="mt-0"><TemplatesPanel /></TabsContent>
              <TabsContent value="pages" className="mt-0"><PagesPanel /></TabsContent>
              <TabsContent value="assets" className="mt-0"><AssetsPanel /></TabsContent>
            </div>
          </Tabs>

          {/* ── Canvas ── */}
          <IframeCanvas onDocReady={onDocReady} />

          {/* ── Right sidebar ── */}
          <Tabs defaultValue="settings" className="w-[280px] border-l flex flex-col !gap-0">
            <TabsList variant="line" className="w-full justify-start rounded-none border-b px-1 h-9 shrink-0">
              <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="size-3.5" />Settings</TabsTrigger>
              <TabsTrigger value="styles" className="text-xs gap-1"><Paintbrush className="size-3.5" />Styles</TabsTrigger>
              <TabsTrigger value="tokens" className="text-xs gap-1"><Palette className="size-3.5" />Tokens</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="settings" className="mt-0"><SettingsPanel /><Separator /><SeoPanel /></TabsContent>
              <TabsContent value="styles" className="mt-0"><StylePanel /></TabsContent>
              <TabsContent value="tokens" className="mt-0"><TokensPanel /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
