"use client"
import { useCallback, useState } from "react"
import {
  Layers, Plus, Settings, Paintbrush, Palette, Monitor, Tablet, Smartphone,
  Undo2, Redo2, LayoutTemplate, Download, FolderDown, Eye, FileText,
  Image as ImageIcon, Save, FolderOpen, History,
} from "lucide-react"
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
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"
import { useKeyboardShortcuts } from "./keyboard-shortcuts"
import { useGoogleFonts } from "../hooks/use-google-fonts"
import { publishFromStore, publishAllPages } from "../../publish"
import { createZip } from "../../zip"

type LeftTab = "navigator" | "components" | "templates" | "pages" | "assets"
type RightTab = "settings" | "styles" | "tokens"

const LEFT_TABS: { id: LeftTab; icon: typeof Layers; label: string }[] = [
  { id: "navigator", icon: Layers, label: "Navigator" },
  { id: "components", icon: Plus, label: "Add" },
  { id: "templates", icon: LayoutTemplate, label: "Blocks" },
  { id: "pages", icon: FileText, label: "Pages" },
  { id: "assets", icon: ImageIcon, label: "Assets" },
]

const RIGHT_TABS: { id: RightTab; icon: typeof Settings; label: string }[] = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "styles", icon: Paintbrush, label: "Styles" },
  { id: "tokens", icon: Palette, label: "Tokens" },
]

export function EditorShell({ projectId, onSaveNew, onOpen, onSaveVersion, onRestoreVersion }: {
  projectId?: string | null
  onSaveNew?: () => void
  onOpen?: () => void
  onSaveVersion?: () => void
  onRestoreVersion?: () => void
}) {
  useKeyboardShortcuts()
  const s = useStore()
  const [leftTab, setLeftTab] = useState<LeftTab>("navigator")
  const [rightTab, setRightTab] = useState<RightTab>("settings")
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null)
  useGoogleFonts(iframeDoc)
  const onDocReady = useCallback((doc: Document) => setIframeDoc(doc), [])

  const undo = () => useEditorV3Store.temporal.getState().undo()
  const redo = () => useEditorV3Store.temporal.getState().redo()

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
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-2 py-1 border-b bg-gray-50/80 backdrop-blur-sm">
        {/* Left: undo/redo + project */}
        <div className="flex items-center gap-0.5">
          <button onClick={undo} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Undo (⌘Z)"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={redo} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Redo (⌘⇧Z)"><Redo2 className="w-3.5 h-3.5" /></button>
          <div className="w-px h-4 bg-gray-200 mx-1.5" />
          {onOpen && <button onClick={onOpen} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Open project"><FolderOpen className="w-3.5 h-3.5" /></button>}
          {onSaveNew && !projectId && <button onClick={onSaveNew} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Save to cloud"><Save className="w-3.5 h-3.5" /></button>}
          {projectId && <span className="text-[10px] text-emerald-600 font-medium ml-1">● Cloud</span>}
          {projectId && onSaveVersion && <button onClick={onSaveVersion} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Save version"><Save className="w-3.5 h-3.5 text-emerald-600" /></button>}
          {projectId && onRestoreVersion && <button onClick={onRestoreVersion} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Version history"><History className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Center: breakpoints */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
          {([["bp-base", Monitor, "Desktop"], ["bp-tablet", Tablet, "Tablet"], ["bp-mobile", Smartphone, "Mobile"]] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => s.setBreakpoint(id)} title={label}
              className={`p-1.5 rounded transition-colors ${s.currentBreakpointId === id ? "bg-white shadow-sm" : "hover:bg-gray-200/60"}`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Right: export + preview */}
        <div className="flex items-center gap-1">
          <button onClick={handleExport} className="px-2 py-1 text-[11px] rounded hover:bg-gray-200 transition-colors" title="Export HTML">
            <Download className="w-3.5 h-3.5 inline mr-1" />Export
          </button>
          <button onClick={handleExportAll} className="px-2 py-1 text-[11px] rounded hover:bg-gray-200 transition-colors" title="Export all pages as zip">
            <FolderDown className="w-3.5 h-3.5 inline mr-1" />All
          </button>
          <button onClick={handlePreview} className="px-2.5 py-1 text-[11px] rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium" title="Preview">
            <Eye className="w-3.5 h-3.5 inline mr-1" />Preview
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <div className="w-[252px] border-r flex flex-col bg-white">
          <div className="flex border-b bg-gray-50/50">
            {LEFT_TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setLeftTab(id)} title={label}
                className={`flex-1 flex items-center justify-center py-2.5 transition-colors ${leftTab === id ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {leftTab === "navigator" && <Navigator />}
            {leftTab === "components" && <ComponentsPanel />}
            {leftTab === "templates" && <TemplatesPanel />}
            {leftTab === "pages" && <PagesPanel />}
            {leftTab === "assets" && <AssetsPanel />}
          </div>
        </div>

        {/* ── Canvas ── */}
        <IframeCanvas onDocReady={onDocReady} />

        {/* ── Right sidebar ── */}
        <div className="w-[280px] border-l flex flex-col bg-white">
          <div className="flex border-b bg-gray-50/50">
            {RIGHT_TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setRightTab(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] transition-colors ${rightTab === id ? "border-b-2 border-blue-500 text-blue-600 font-medium" : "text-gray-400 hover:text-gray-600"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightTab === "settings" && <><SettingsPanel /><div className="border-t" /><SeoPanel /></>}
            {rightTab === "styles" && <StylePanel />}
            {rightTab === "tokens" && <TokensPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}
