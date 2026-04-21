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

interface Props {
  pageTitle: string;
  onPageTitleChange: (v: string) => void;
  dirty: boolean;
  saving: boolean;
  zoom: number;
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

function Btn({ icon, label, onClick, disabled, active }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <Tip label={label}>
      <button onClick={onClick} disabled={disabled}
        className={cn("flex size-8 items-center justify-center rounded-md transition-all disabled:opacity-20",
          active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted")}>
        <MIcon name={icon} size={14} />
      </button>
    </Tip>
  );
}

export default function EditorNavigation({
  pageTitle, onPageTitleChange, dirty, saving, zoom,
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
      <header className="flex h-11 items-center border-b border-border/50 bg-background px-3 select-none relative z-10" onClick={(e) => e.stopPropagation()}>

        {/* ── Left ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0 h-full">
          <Tip label="Back to dashboard">
            <Link href="/dashboard/pages" className="flex size-8 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
              <MIcon name="arrow_back" size={15} />
            </Link>
          </Tip>

          <div className="h-5 w-px bg-border/40 mx-0.5" />

          <input
            className="h-8 w-40 rounded-md border border-transparent bg-transparent px-2 text-[12px] font-medium outline-none hover:border-border/50 focus:border-foreground/20 focus:bg-muted/30 transition-all truncate"
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            spellCheck={false}
          />

          <span className={cn("text-[9px] font-medium transition-colors shrink-0",
            saving ? "text-muted-foreground/40" : dirty ? "text-amber-500/70" : "text-emerald-500/50")}>
            {saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}
          </span>
        </div>

        {/* ── Center ── */}
        <div className="flex items-center gap-1 h-full">
          <Btn icon="undo" label="Undo ⌘Z" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} />
          <Btn icon="redo" label="Redo ⌘⇧Z" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} />

          <div className="h-5 w-px bg-border/40 mx-1.5" />

          <div className="flex items-center rounded-lg border border-border/40 p-0.5 gap-0 bg-muted/30">
            {devices.map(([d, icon, label]) => (
              <Tip key={d} label={label}>
                <button onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn("flex size-7 items-center justify-center rounded-md transition-all",
                    device === d ? "bg-foreground text-background shadow-sm" : "text-muted-foreground/70 hover:text-foreground")}>
                  <MIcon name={icon} size={13} />
                </button>
              </Tip>
            ))}
          </div>

          <div className="h-5 w-px bg-border/40 mx-1.5" />

          <Btn icon="remove" label="Zoom out ⌘−" onClick={onZoomOut} />
          <Tip label="Reset zoom ⌘0">
            <button onClick={onZoomReset} className="min-w-[40px] text-center text-[10px] font-mono text-muted-foreground/70 tabular-nums hover:text-foreground hover:bg-muted transition-colors rounded-md h-8 px-1">
              {zoom}%
            </button>
          </Tip>
          <Btn icon="add" label="Zoom in ⌘+" onClick={onZoomIn} />
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-1 flex-1 justify-end min-w-0 h-full">
          <Btn icon={preview ? "edit" : "visibility"} label={preview ? "Edit mode" : "Preview"} onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} active={preview} />
          <Btn icon="code" label="Export HTML" onClick={onExportHTML} />

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
                <MIcon name="tune" size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">SEO Settings</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider mb-1 block">Title</label>
                  <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea value={metaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)}
                    className="w-full rounded-md border border-border/50 bg-transparent px-2.5 py-1.5 text-xs outline-none resize-none h-16 focus:border-foreground/20 transition-colors" placeholder="Brief description for search engines…" />
                </div>
                <div>
                  <label className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider mb-1 block">OG Image</label>
                  <Input value={ogImage} onChange={(e) => onOgImageChange(e.target.value)} className="h-8 text-xs" placeholder="https://…" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-5 w-px bg-border/40 mx-0.5" />

          <Button size="sm" variant="ghost" onClick={onSave}
            className="h-8 gap-1 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
            <MIcon name="save" size={13} />
            Save
            {dirty && !saving && <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
          </Button>

          <Button size="sm" onClick={onPublish}
            className="h-8 gap-2 px-3.5 text-[11px] font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
            Publish
          </Button>
        </div>

      </header>
    </TooltipProvider>
  );
}
