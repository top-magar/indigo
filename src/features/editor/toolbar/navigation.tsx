"use client";

import Link from "next/link";
import { MIcon } from "../ui/m-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side="bottom" className="text-[10px] px-2 py-1 bg-neutral-800 text-neutral-200 border-neutral-700">{label}</TooltipContent></Tooltip>;
}

function TBtn({ icon, label, onClick, disabled, active, size = 14 }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; active?: boolean; size?: number }) {
  return (
    <Tip label={label}>
      <button onClick={onClick} disabled={disabled}
        className={cn("flex size-7 items-center justify-center rounded transition-all disabled:opacity-20",
          active ? "bg-white/15 text-white" : "text-neutral-400 hover:text-white hover:bg-white/10")}>
        <MIcon name={icon} size={size} />
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
    <TooltipProvider delayDuration={300}>
      <header className="flex h-10 items-center bg-neutral-900 px-2 select-none relative z-10 gap-1" onClick={(e) => e.stopPropagation()}>

        {/* ── Left: back + page name ── */}
        <div className="flex items-center gap-1 flex-1 min-w-0 h-full">
          <Tip label="Back to dashboard">
            <Link href="/dashboard/pages" className="flex size-7 items-center justify-center rounded text-neutral-500 hover:text-white hover:bg-white/10 transition-colors">
              <MIcon name="arrow_back" size={14} />
            </Link>
          </Tip>

          <div className="h-4 w-px bg-neutral-700 mx-0.5" />

          <input
            className="h-6 w-36 rounded bg-transparent px-1.5 text-[11px] font-medium text-neutral-300 outline-none hover:bg-white/5 focus:bg-white/10 focus:text-white transition-all truncate border border-transparent focus:border-neutral-600"
            value={pageTitle}
            onChange={(e) => onPageTitleChange(e.target.value)}
            spellCheck={false}
          />

          <span className={cn("text-[9px] font-medium shrink-0",
            saving ? "text-neutral-600" : dirty ? "text-amber-500/80" : "text-emerald-500/60")}>
            {saving ? "Saving…" : dirty ? "•" : ""}
          </span>
        </div>

        {/* ── Center: tools ── */}
        <div className="flex items-center gap-0.5 h-full">
          <TBtn icon="undo" label="Undo ⌘Z" onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} />
          <TBtn icon="redo" label="Redo ⌘⇧Z" onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} />

          <div className="h-3.5 w-px bg-neutral-700 mx-1" />

          {/* Device switcher */}
          <div className="flex items-center rounded-md bg-white/5 p-0.5 gap-0">
            {devices.map(([d, icon, label]) => (
              <Tip key={d} label={label}>
                <button onClick={() => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })}
                  className={cn("flex size-6 items-center justify-center rounded transition-all",
                    device === d ? "bg-white/15 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300")}>
                  <MIcon name={icon} size={12} />
                </button>
              </Tip>
            ))}
          </div>

          <div className="h-3.5 w-px bg-neutral-700 mx-1" />

          {/* Zoom */}
          <TBtn icon="remove" label="Zoom out ⌘−" onClick={onZoomOut} size={12} />
          <Tip label="Reset zoom ⌘0">
            <button onClick={onZoomReset} className="min-w-[36px] text-center text-[10px] font-mono text-neutral-400 tabular-nums hover:text-white hover:bg-white/10 transition-colors rounded h-6 px-1">
              {zoom}%
            </button>
          </Tip>
          <TBtn icon="add" label="Zoom in ⌘+" onClick={onZoomIn} size={12} />
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-0.5 flex-1 justify-end min-w-0 h-full">
          <TBtn icon={preview ? "edit" : "visibility"} label={preview ? "Edit ⌘P" : "Preview ⌘P"} onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })} active={preview} />
          <TBtn icon="code" label="Export HTML" onClick={onExportHTML} />

          {/* SEO */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex size-7 items-center justify-center rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
                <MIcon name="tune" size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-4 bg-neutral-900 border-neutral-700 text-neutral-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">SEO</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">Title</label>
                  <Input value={pageTitle} onChange={(e) => onPageTitleChange(e.target.value)} className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-200" />
                </div>
                <div>
                  <label className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea value={metaDescription} onChange={(e) => onMetaDescriptionChange(e.target.value)}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 outline-none resize-none h-16 focus:border-neutral-500 transition-colors" placeholder="Brief description…" />
                </div>
                <div>
                  <label className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider mb-1 block">OG Image</label>
                  <Input value={ogImage} onChange={(e) => onOgImageChange(e.target.value)} className="h-7 text-xs bg-neutral-800 border-neutral-700 text-neutral-200" placeholder="https://…" />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-3.5 w-px bg-neutral-700 mx-0.5" />

          <Tip label="Save ⌘S">
            <button onClick={onSave}
              className="flex items-center gap-1 h-6 px-2 rounded text-[10px] font-medium text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <MIcon name="save" size={12} />
              {dirty && !saving && <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
            </button>
          </Tip>

          <button onClick={onPublish}
            className="flex items-center gap-1 h-6 px-3 rounded-md text-[10px] font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-colors ml-0.5">
            <MIcon name="play_arrow" size={12} />
            Publish
          </button>
        </div>

      </header>
    </TooltipProvider>
  );
}
