"use client"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Tablet, Smartphone, Eye, FileText, FolderOpen, History, Columns3, Undo2, Redo2 } from "lucide-react"
import { useStore } from "../use-store"
import { useEditorV3Store } from "../../stores/store"

function ToolbarButton({ onClick, tooltip, children }: { onClick: () => void; tooltip: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

const BREAKPOINTS = [
  { id: "bp-base", icon: Monitor, label: "Desktop" },
  { id: "bp-tablet", icon: Tablet, label: "Tablet (768px)" },
  { id: "bp-mobile", icon: Smartphone, label: "Mobile (375px)" },
] as const

export function EditorToolbar({ projectId, onOpen, onSaveVersion, responsiveMode, onToggleResponsive, onPreview, onPublish }: {
  projectId?: string | null
  onOpen?: () => void
  onSaveVersion?: () => void
  responsiveMode: boolean
  onToggleResponsive: () => void
  onPreview: () => void
  onPublish: () => void
}) {
  const s = useStore()

  return (
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
        <Separator orientation="vertical" className="h-4" />
        <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().undo()} tooltip="Undo (⌘Z)"><Undo2 className="size-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => useEditorV3Store.temporal.getState().redo()} tooltip="Redo (⌘⇧Z)"><Redo2 className="size-3.5" /></ToolbarButton>
      </div>

      {/* Center: Breakpoints */}
      <ToggleGroup type="single" value={s.currentBreakpointId} onValueChange={(v) => { if (v) s.setBreakpoint(v) }} size="sm" className="bg-muted rounded-lg p-0.5 gap-0">
        {BREAKPOINTS.map(({ id, icon: Icon, label }) => (
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
        <ToolbarButton onClick={onToggleResponsive} tooltip="Responsive preview">
          <Columns3 className={`size-3.5 ${responsiveMode ? "text-primary" : ""}`} />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-4 mx-0.5" />
        <Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={onPreview}><Eye className="size-3.5" />Preview</Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Preview in new tab</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild>
          <Button size="sm" className="h-7 text-[11px] gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onPublish}>
            Publish
          </Button>
        </TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">Export as HTML</TooltipContent></Tooltip>
      </div>
    </div>
  )
}
