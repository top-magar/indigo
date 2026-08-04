"use client";

import { useState, type CSSProperties } from "react";
import { MIcon } from "../../ui/m-icon";
import type { El } from "../../core/types";
import { cn } from "@/shared/utils";
import { useEditor } from "../../core/provider";
import { findParentId } from "../../core/tree-helpers";
import DesignTab from "./design-tab";
import ContentTab from "./content-tab";

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const [tab, setTab] = useState<"content" | "layout" | "style" | "advanced">("content");
  const selected = state.editor.selected;
  if (!selected) return null;

  const device = state.editor.device;
  const resolved = device === "desktop" ? selected.styles : { ...selected.styles, ...selected.responsiveStyles?.[device] };
  const s = resolved as Record<string, unknown>;
  const get = (p: string) => String(s[p] ?? "");
  const set = (p: string, v: string) => {
    if (device === "desktop") {
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties } } });
    } else {
      const prev = selected.responsiveStyles ?? {};
      dispatch({ type: "UPDATE_ELEMENT_LIVE", payload: { element: { ...selected, responsiveStyles: { ...prev, [device]: { ...prev[device], [p]: v } } } } });
    }
  };
  const onUpdate = (el: El) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: el } });
  const parentId = findParentId(state.editor.elements, selected.id);
  const isBody = selected.type === "__body";

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Actions + name */}
      <div className="flex items-center gap-1 px-3 h-8 border-b border-sidebar-border shrink-0">
        <input aria-label="Selected element name" className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-xs outline-none border border-transparent hover:border-sidebar-border focus:border-primary transition-all" value={selected.name} onChange={(e) => onUpdate({ ...selected, name: e.target.value })} />
        {device !== "desktop" && <span className="shrink-0 px-1.5 text-xs h-5 flex items-center rounded-md bg-primary/10 text-primary font-medium capitalize">{device}</span>}
        {parentId && <button aria-label="Duplicate element" className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" onClick={() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elId: selected.id, containerId: parentId } })}><MIcon name="content_copy" size={13} /></button>}
        <button aria-label={selected.locked ? "Unlock element" : "Lock element"} className={cn("flex size-8 items-center justify-center rounded-md transition-colors", selected.locked ? "text-warning" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent")} onClick={() => onUpdate({ ...selected, locked: !selected.locked })}><MIcon name={selected.locked ? "lock" : "lock_open"} size={13} /></button>
        <button aria-label={selected.hidden ? "Show element" : "Hide element"} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" onClick={() => onUpdate({ ...selected, hidden: !selected.hidden })}><MIcon name={selected.hidden ? "visibility_off" : "visibility"} size={13} /></button>
        {!isBody && <button aria-label="Delete element" className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={() => dispatch({ type: "DELETE_ELEMENT", payload: { id: selected.id } })}><MIcon name="delete" size={13} /></button>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sidebar-border shrink-0">
        {(["content", "layout", "style", "advanced"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("min-w-0 flex-1 h-9 px-1 text-xs font-medium capitalize transition-colors", tab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "content" && <ContentTab selected={selected} onUpdate={onUpdate} />}
        {tab === "layout" && <DesignTab mode="layout" get={get} set={set} selected={selected} onUpdate={onUpdate} />}
        {tab === "style" && <DesignTab mode="style" get={get} set={set} selected={selected} onUpdate={onUpdate} />}
        {tab === "advanced" && <DesignTab mode="advanced" get={get} set={set} selected={selected} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
