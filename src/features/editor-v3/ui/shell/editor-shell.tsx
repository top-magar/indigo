"use client"
import { useCallback, useState } from "react"
import {
  Layers, Plus, Settings, Paintbrush, Palette, Monitor, Tablet, Smartphone,
  LayoutTemplate, Eye, FileText,
  Image as ImageIcon, FolderOpen, History, Columns3, Sparkles, Accessibility, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IframeCanvas } from "../canvas/iframe-canvas"
import { ResponsivePreview } from "../canvas/responsive-preview"
import { Navigator } from "../sidebar/navigator"
import { ComponentsPanel } from "../sidebar/components-panel"
import { TemplatesPanel } from "../sidebar/templates-panel"
import { PagesPanel } from "../sidebar/pages-panel"
import { AssetsPanel } from "../sidebar/assets-panel"
import { SettingsPanel } from "../panels/settings-panel"
import { StylePanel } from "../panels/style-panel"
import { SeoPanel } from "../panels/seo-panel"
import { TokensPanel } from "../panels/tokens-panel"
import { StylePresetsPanel } from "../panels/style-presets-panel"
import { AccessibilityPanel } from "../panels/accessibility-panel"
import { SelectionBreadcrumb } from "./selection-breadcrumb"
import { CommandPalette } from "./command-palette"
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
  const [responsiveMode, setResponsiveMode] = useState(false)

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


  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <CommandPalette />
        {/* ── Toolbar (Webflow/Framer pattern) ── */}
        <div className="flex items-center justify-between px-3 h-10 border-b bg-background">
          {/* Left: Logo + Page selector */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold tracking-tight shrink-0">Indigo</span>
            <Separator orientation="vertical" className="h-4" />
            <Select value={s.currentPageId ?? ""} onValueChange={(v) => s.setPage(v)}>
              <SelectTrigger className="h-7 text-[11px] border-0 bg-transparent shadow-none px-1.5 gap-1 min-w-0 max-w-[160px]">
                <FileText className="size-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {[...s.pages.values()].map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-[11px]">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectId && <span className="text-[9px] text-emerald-600 font-medium px-1.5 py-0.5 bg-emerald-50 rounded-full shrink-0">Saved</span>}
          </div>

          {/* Center: Compact breakpoints (icons only, tooltip for labels) */}
          <ToggleGroup type="single" value={s.currentBreakpointId} onValueChange={(v) => { if (v) s.setBreakpoint(v) }} size="sm" className="bg-muted rounded-lg p-0.5 gap-0">
            {([
              { id: "bp-base", icon: Monitor, label: "Desktop" },
              { id: "bp-tablet", icon: Tablet, label: "Tablet (768px)" },
              { id: "bp-mobile", icon: Smartphone, label: "Mobile (375px)" },
            ] as const).map(({ id, icon: Icon, label }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value={id} className="h-7 w-7 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <Icon className="size-3.5" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">{label}</TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>

          {/* Right: Actions + Publish */}
          <div className="flex items-center gap-1">
            {onOpen && <ToolbarButton onClick={onOpen} tooltip="Open project (⌘O)"><FolderOpen className="size-3.5" /></ToolbarButton>}
            {projectId && onSaveVersion && <ToolbarButton onClick={onSaveVersion} tooltip="Save version"><History className="size-3.5" /></ToolbarButton>}
            <ToolbarButton onClick={() => setResponsiveMode(!responsiveMode)} tooltip="Responsive preview">
              <Columns3 className={`size-3.5 ${responsiveMode ? "text-primary" : ""}`} />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-4 mx-0.5" />
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={handlePreview}><Eye className="size-3.5" />Preview</Button>
            <Button size="sm" className="h-7 text-[11px] gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleExport}>
              Publish
            </Button>
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
          {responsiveMode ? <ResponsivePreview /> : <IframeCanvas onDocReady={onDocReady} />}

          {/* ── Right sidebar — 2 tabs only (Webflow/Webstudio pattern) ── */}
          <Tabs defaultValue="style" className="w-[280px] border-l flex flex-col !gap-0">
            <TabsList variant="line" className="w-full justify-start rounded-none border-b px-1 h-9 shrink-0">
              <TabsTrigger value="style" className="text-xs gap-1"><Paintbrush className="size-3.5" />Style</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs gap-1"><Settings className="size-3.5" />Settings</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="style" className="mt-0">
                <StylePanel />
                <Separator />
                <Collapsible defaultOpen={false} className="group/presets">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-accent/50">
                    <span className="flex items-center gap-1.5"><Sparkles className="size-3" />Presets</span>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/presets:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent><StylePresetsPanel /></CollapsibleContent>
                </Collapsible>
              </TabsContent>
              <TabsContent value="settings" className="mt-0">
                <SettingsPanel />
                <Separator />
                <Collapsible defaultOpen={false} className="group/seo">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-accent/50">
                    <span className="flex items-center gap-1.5"><FileText className="size-3" />SEO & Meta</span>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/seo:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent><SeoPanel /></CollapsibleContent>
                </Collapsible>
                <Collapsible defaultOpen={false} className="group/tokens">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-accent/50">
                    <span className="flex items-center gap-1.5"><Palette className="size-3" />Design Tokens</span>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/tokens:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent><TokensPanel /></CollapsibleContent>
                </Collapsible>
                <Collapsible defaultOpen={false} className="group/a11y">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium hover:bg-accent/50">
                    <span className="flex items-center gap-1.5"><Accessibility className="size-3" />Accessibility</span>
                    <ChevronRight className="size-3 transition-transform group-data-[state=open]/a11y:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent><AccessibilityPanel /></CollapsibleContent>
                </Collapsible>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* ── Bottom bar (Framer pattern) ── */}
        <div className="h-8 border-t bg-muted/30 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <SelectionBreadcrumb />
            {!s.selectedInstanceId && (
              <span className="text-[10px] text-muted-foreground/70 font-medium">{s.instances.size} elements</span>
            )}
          </div>
          <div className="flex items-center bg-muted rounded-md p-0.5 gap-0">
            <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom - 25)}>
              <span className="text-[11px] font-medium text-muted-foreground">−</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2.5 rounded-sm text-[11px] font-medium text-foreground min-w-[48px] hover:bg-background"
              onClick={() => useEditorV3Store.getState().setZoom(100)}>
              {s.zoom}%
            </Button>
            <Button variant="ghost" size="icon" className="size-6 rounded-sm hover:bg-background" onClick={() => useEditorV3Store.getState().setZoom(s.zoom + 25)}>
              <span className="text-[11px] font-medium text-muted-foreground">+</span>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
