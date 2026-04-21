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

interface EditorNavigationProps {
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
  onSave: () => void;
  onExportHTML: () => void;
  onPublish: () => void;
}

function Tip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-[10px] px-2 py-1">{label}</TooltipContent>
    </Tooltip>
  );
}

function IconBtn({ icon, label, onClick, disabled, active, className }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; active?: boolean; className?: string }) {
  return (
    <Tip label={label}>
      <button onClick={onClick} disabled={disabled} className={cn("flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-30", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted", className)}>
        <MIcon name={icon} size={15} />
      </button>
    </Tip>
  );
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-border/50" />;
}

export default function EditorNavigation({
  pageTitle, onPageTitleChange, dirty, saving, zoom,
  metaDescription, onMetaDescriptionChange, ogImage, onOgImageChange,
  onZoomIn, onZoomOut, onSave, onExportHTML, onPublish,
}: EditorNavigationProps) {
  const { state, dispatch } = useEditor();
  const device = state.editor.device;
  const preview = state.editor.preview;
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.snapshots.length - 1;

  return (
    <TooltipProvider delayDuration={200}>
      <header className="flex h-11 items-center border-b bg-background px-2 gap-1 select-none">

        {/* ── Left: Logo + Back + Title ── */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-visible">
          <Tip label="Back to pages">
            <Link href="/dashboard/pages" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <MIcon name="arrow_back" size={15} />
            </Link>
          </Tip>

          <Sep />

          <input
            className="h-7 w-36 rounded-md border border-transparent bg-transparent px-2 text-[13px] font-medium outline-none hover:border-border focus:border-primary focus:bg-muted/50 transition-all truncate"
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            spellCheck={false}
          />

          {/* Save status */}
          <span className={cn("text-[10px] ml-1 transition-all", saving ? "text-muted-foreground" : dirty ? "text-amber-500" : "text-emerald-500/70")}>
            {saving ? "Saving..." : dirty ? "Unsaved" : "Saved"}
          </span>

          <Sep />

        </div>

        {/* ── Center: Undo/Redo + Devices + Zoom ── */}
        <div className="flex items-center gap-0.5">
          <IconBtn icon="undo" label="Undo (⌘Z)" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} />
          <IconBtn icon="redo" label="Redo (⌘⇧Z)" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} />

          <Sep />

          <div className="flex items-center rounded-md border p-0.5 gap-px">
            {devices.map(([d, icon, label]) => (
              <Tip key={d} label={label}>
                <button
                  onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn("flex size-6 items-center justify-center rounded transition-all", device === d ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  <MIcon name={icon} size={13} />
                </button>
              </Tip>
            ))}
          </div>

          <Sep />

          <div className="flex items-center gap-0.5">
            <IconBtn icon="remove" label="Zoom out" onClick={onZoomOut} />
            <button onClick={() => { /* reset to 100% */ }} className="w-9 text-center text-[11px] font-mono text-muted-foreground tabular-nums hover:text-foreground transition-colors rounded-md hover:bg-muted py-0.5">
              {zoom}%
            </button>
            <IconBtn icon="add" label="Zoom in" onClick={onZoomIn} />
          </div>
        </div>

        {/* ── Right: Preview + Settings + Actions ── */}
        <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
          <IconBtn icon={preview ? "edit" : "visibility"} label={preview ? "Edit mode" : "Preview"} onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} active={preview} />

          <Popover>
            <Tip label="Page settings">
              <PopoverTrigger asChild>
                <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <MIcon name="settings" size={15} />
                </button>
              </PopoverTrigger>
            </Tip>
            <PopoverContent align="end" className="w-72 p-3">
              <p className="text-xs font-semibold mb-3">Page Settings</p>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Title</label>
                  <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} className="h-7 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Meta Description</label>
                  <textarea value={metaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)} className="w-full rounded-md border bg-transparent px-2.5 py-1.5 text-xs outline-none resize-none h-16 focus:border-primary transition-colors" placeholder="Brief description for search engines..." />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">OG Image</label>
                  <Input value={ogImage} onChange={(e) => onOgImageChange(e.target.value)} className="h-7 text-xs" placeholder="https://..." />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <IconBtn icon="code" label="Export HTML" onClick={onExportHTML} />

          <Sep />

          <Button size="sm" variant="ghost" onClick={onSave} className="h-7 gap-1.5 px-2.5 text-xs font-medium">
            <MIcon name="save" size={14} />
            Save
            {dirty && !saving && <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
          </Button>

          <Button size="sm" onClick={onPublish} className="h-7 gap-1.5 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white">
            <MIcon name="public" size={14} />
            Publish
          </Button>
        </div>

      </header>
    </TooltipProvider>
  );
}
