"use client";

import { useState, type CSSProperties } from "react";
import { MIcon } from "../../ui/m-icon";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import DesignTab from "./design-tab";
import ContentTab from "./content-tab";

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  if (!selected) return null;

  const device = state.editor.device;
  const resolved = device === "Desktop" ? selected.styles : { ...selected.styles, ...selected.responsiveStyles?.[device] };
  const s = resolved as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => {
    if (device === "Desktop") {
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });
  const parentId = findParentId(state.editor.elements, selected.id);
  const isBody = selected.type === "__body";
  const [tab, setTab] = useState<"design" | "content">("design");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Actions row */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-neutral-800 shrink-0">
        <input className="h-6 min-w-0 flex-1 rounded bg-transparent px-1.5 text-[11px] text-neutral-200 outline-none border border-transparent hover:border-neutral-700 focus:border-neutral-600 focus:bg-neutral-800/50 transition-all" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
        {device !== "Desktop" && <span className="shrink-0 px-1.5 py-0 text-[9px] h-4 flex items-center rounded bg-blue-500/15 text-blue-400 font-medium">{device}</span>}
      </div>
      <div className="flex items-center gap-0.5 px-3 py-1 border-b border-neutral-800 shrink-0">
        {parentId && <button className="flex size-6 items-center justify-center rounded text-neutral-500 hover:text-neutral-200 hover:bg-white/5 transition-colors" onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } })}><MIcon name="content_copy" size={12} /></button>}
        <button className={cn("flex size-6 items-center justify-center rounded transition-colors", selected.locked ? "text-amber-400" : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}><MIcon name={selected.locked ? "lock" : "lock_open"} size={12} /></button>
        <button className={cn("flex size-6 items-center justify-center rounded transition-colors", selected.hidden ? "text-neutral-600" : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5")} onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}><MIcon name={selected.hidden ? "visibility_off" : "visibility"} size={12} /></button>
        <div className="flex-1" />
        {!isBody && <button className="flex size-6 items-center justify-center rounded text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={12} /></button>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 shrink-0">
        {(["design", "content"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 h-7 text-[10px] font-medium capitalize transition-colors", tab === t ? "text-white border-b border-blue-500" : "text-neutral-500 hover:text-neutral-300")}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "design" && <DesignTab get={get} set={set} selected={selected} onUpdate={onUpdate} />}
        {tab === "content" && <ContentTab selected={selected} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
