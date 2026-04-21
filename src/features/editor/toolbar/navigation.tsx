"use client";

import Link from "next/link";
import { MIcon } from "../ui/m-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Device } from "../core/types";
import { useEditor } from "../core/provider";

const devices: [Device, string, string][] = [
  ["Desktop", "laptop_mac", "Desktop"],
  ["Tablet", "tablet_mac", "Tablet"],
  ["Mobile", "smartphone", "Mobile"],
];

export type Tool = "pointer" | "hand" | "text" | "frame" | "image";
const tools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: "pointer", icon: "near_me", label: "Select", shortcut: "V" },
  { id: "hand", icon: "pan_tool", label: "Hand", shortcut: "H" },
  { id: "frame", icon: "crop_free", label: "Frame", shortcut: "F" },
  { id: "text", icon: "text_fields", label: "Text", shortcut: "T" },
  { id: "image", icon: "image", label: "Image", shortcut: "I" },
];

interface Props {
  pageTitle: string;
  onPageTitleChange: (v: string) => void;
  dirty: boolean;
  saving: boolean;
  zoom: number;
  activeTool: Tool;
  onToolChange: (t: Tool) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  ogImage: string;
  onOgImageChange: (v: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset?: () => void;
  onSave: () => void;
  onExportHTML: () => void;
  onPublish: () => void;
}

function Tip({ children, label }: { children: React.ReactNode; label: string }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side="bottom" className="text-[10px]">{label}</TooltipContent></Tooltip>;
}

function Btn({ icon, label, onClick, disabled, active, size = 14 }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; active?: boolean; size?: number }) {
  return (
    <Tip label={label}>
      <button onClick={onClick} disabled={disabled}
        className={cn("flex size-7 items-center justify-center rounded-md transition-all disabled:opacity-20",
          active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted")}>
        <MIcon name={icon} size={size} />
      </button>
    </Tip>
  );
}

export default function EditorNavigation({
  pageTitle, onPageTitleChange, dirty, saving, zoom, activeTool, onToolChange,
  metaDescription, onMetaDescriptionChange, ogImage, onOgImageChange,
  onZoomIn, onZoomOut, onZoomReset, onSave, onExportHTML, onPublish,
}: Props) {
  const { state, dispatch } = useEditor();
  const device = state.editor.device;
  const preview = state.editor.preview;
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.snapshots.length - 1;

  return (
    <TooltipProvider delayDuration={200}>
      <header className="flex h-10 items-center border-b border-border/40 bg-background px-2 select-none relative z-10" onClick={(e) => e.stopPropagation()}>

        {/* ── Left: back + title ── */}
        <div className="flex items-center gap-1 min-w-0 h-full">
          <Tip label="Dashboard">
            <Link href="/dashboard/pages" className="flex size-7 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
              <MIcon name="arrow_back" size={14} />
            </Link>
          </Tip>
          <input
            className="h-7 w-32 rounded-md bg-transparent px-1.5 text-[11px] font-medium outline-none border border-transparent hover:border-border/40 focus:border-primary/40 transition-all truncate"
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            spellCheck={false}
          />
          <span className={cn("text-[9px] shrink-0",
            saving ? "text-muted-foreground/40" : dirty ? "text-amber-500/70" : "text-emerald-500/40")}>
            {saving ? "…" : dirty ? "●" : ""}
          </span>
        </div>

        {/* ── Center: tools + devices + zoom ── */}
        <div className="flex items-center gap-1 mx-auto h-full">
          {/* Tools */}
          <div className="flex items-center rounded-lg border border-border/40 p-0.5 bg-muted/20">
            {tools.map((t) => (
              <Tip key={t.id} label={`${t.label} (${t.shortcut})`}>
                <button onClick={() => onToolChange(t.id)}
                  className={cn("flex size-6 items-center justify-center rounded-md transition-all",
                    activeTool === t.id ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/70 hover:text-foreground")}>
                  <MIcon name={t.icon} size={13} />
                </button>
              </Tip>
            ))}
          </div>

          <div className="h-4 w-px bg-border/30 mx-1" />

          {/* Undo/Redo */}
          <Btn icon="undo" label="Undo ⌘Z" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} size={13} />
          <Btn icon="redo" label="Redo ⌘⇧Z" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} size={13} />

          <div className="h-4 w-px bg-border/30 mx-1" />

          {/* Devices */}
          <div className="flex items-center rounded-lg border border-border/40 p-0.5 bg-muted/20">
            {devices.map(([d, icon, label]) => (
              <Tip key={d} label={label}>
                <button onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn("flex size-6 items-center justify-center rounded-md transition-all",
                    device === d ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/70 hover:text-foreground")}>
                  <MIcon name={icon} size={12} />
                </button>
              </Tip>
            ))}
          </div>

          <div className="h-4 w-px bg-border/30 mx-1" />

          {/* Zoom */}
          <Btn icon="remove" label="Zoom out ⌘−" onClick={onZoomOut} size={12} />
          <Tip label="Reset ⌘0">
            <button onClick={onZoomReset} className="min-w-[34px] text-center text-[10px] font-mono text-muted-foreground/70 tabular-nums hover:text-foreground hover:bg-muted transition-colors rounded-md h-6 px-1">
              {zoom}%
            </button>
          </Tip>
          <Btn icon="add" label="Zoom in ⌘+" onClick={onZoomIn} size={12} />
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-1 min-w-0 h-full">
          <Btn icon={preview ? "edit" : "visibility"} label={preview ? "Edit" : "Preview"} onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} active={preview} />
          <Btn icon="code" label="Export HTML" onClick={onExportHTML} />

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
                <MIcon name="tune" size={13} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-2">SEO</p>
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-0.5 block">Title</label>
                  <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} className="h-7 text-[11px]" />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-0.5 block">Description</label>
                  <textarea value={metaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)}
                    className="w-full rounded-md border border-border/40 bg-transparent px-2 py-1.5 text-[11px] outline-none resize-none h-14 focus:border-primary/40 transition-colors" placeholder="Brief description…" />
                </div>
                <div>
                  <label className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mb-0.5 block">OG Image</label>
                  <Input value={ogImage} onChange={(e) => onOgImageChange(e.target.value)} className="h-7 text-[11px]" placeholder="https://…" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-4 w-px bg-border/30 mx-0.5" />

          <Tip label="Save ⌘S">
            <button onClick={onSave} className="flex size-7 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
              <MIcon name="save" size={13} />
              {dirty && !saving && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500" />}
            </button>
          </Tip>

          <Button size="sm" onClick={onPublish}
            className="h-7 px-3 text-[10px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-md">
            Publish
          </Button>
        </div>

      </header>
    </TooltipProvider>
  );
}
