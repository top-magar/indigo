"use client";

import { useState } from "react";
import { MIcon } from "../../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { Section, IconToggle, SelectField, selectOptions, px, strip, Tip, type StyleProps } from "../shared";
import { N } from "./measures-menu";
import { cn } from "@/shared/utils";
import type { El } from "../../../core/types";

const dirOpts = [
  { value: "row", label: "Row", icon: <MIcon name="arrow_forward" size={14} /> },
  { value: "column", label: "Column", icon: <MIcon name="arrow_downward" size={14} /> },
  { value: "row-reverse", label: "Row reverse", icon: <MIcon name="arrow_back" size={14} /> },
  { value: "column-reverse", label: "Col reverse", icon: <MIcon name="arrow_upward" size={14} /> },
];

// ─── 3×3 Alignment Grid ─────────────────────────────────────

const ALIGN_MAP: Record<string, [string, string]> = {
  "tl": ["flex-start", "flex-start"], "tc": ["flex-start", "center"], "tr": ["flex-start", "flex-end"],
  "ml": ["center", "flex-start"],     "mc": ["center", "center"],     "mr": ["center", "flex-end"],
  "bl": ["flex-end", "flex-start"],   "bc": ["flex-end", "center"],   "br": ["flex-end", "flex-end"],
};

function AlignGrid({ align, justify, isCol, onChange }: { align: string; justify: string; isCol: boolean; onChange: (a: string, j: string) => void }) {
  const getKey = () => {
    const rowMap: Record<string, string> = { "flex-start": "l", "center": "c", "flex-end": "r", "stretch": "l" };
    const colMap: Record<string, string> = { "flex-start": "t", "center": "m", "flex-end": "b", "stretch": "t" };
    if (isCol) return `${colMap[justify] || "t"}${rowMap[align] || "l"}`;
    return `${colMap[align] || "t"}${rowMap[justify] || "l"}`;
  };
  const active = getKey();

  return (
    <div className="grid grid-cols-3 gap-px rounded-md border border-sidebar-border overflow-hidden bg-sidebar-border w-fit">
      {["tl","tc","tr","ml","mc","mr","bl","bc","br"].map((k) => {
        const [a, j] = ALIGN_MAP[k];
        return (
          <button key={k} onClick={() => onChange(isCol ? j : a, isCol ? a : j)}
            className={cn("size-5 flex items-center justify-center transition-colors",
              active === k ? "bg-primary text-primary-foreground" : "bg-sidebar hover:bg-sidebar-accent")}>
            <div className={cn("size-1 rounded-full", active === k ? "bg-primary-foreground" : "bg-muted-foreground/40")} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Layout Menu ─────────────────────────────────────────────

export function LayoutMenu({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const [padLinked, setPadLinked] = useState(true);
  const [marLinked, setMarLinked] = useState(true);
  const display = get("display");
  const isFlex = display === "flex";
  const isGrid = display === "grid";
  const isCol = get("flexDirection") === "column" || get("flexDirection") === "column-reverse";
  const isWrap = get("flexWrap") === "wrap";

  return (
    <Section title="Layout" icon="grid_view">
      <div className="space-y-2">

        {/* ─── Size ─── */}
        <div>
          <IconToggle
            value={get("width") === "fit-content" ? "hug" : get("width") === "100%" || get("flex") === "1" ? "fill" : "fixed"}
            options={[
              { value: "hug", label: "Hug content", icon: <MIcon name="fit_screen" size={14} /> },
              { value: "fill", label: "Fill container", icon: <MIcon name="expand" size={14} /> },
              { value: "fixed", label: "Fixed size", icon: <MIcon name="width" size={14} /> },
            ]}
            onChange={(v) => { if (v === "hug") { set("width", "fit-content"); set("flex", ""); } else if (v === "fill") { set("width", "100%"); set("flex", ""); } else { set("width", "auto"); set("flex", ""); } }}
          />
          <div className="grid grid-cols-2 gap-1 mt-1">
            <N icon="W" value={get("width")} onChange={(v) => set("width", v)} tip="Width" />
            <N icon="H" value={get("height")} onChange={(v) => set("height", v)} tip="Height" />
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <N icon="↕" value={get("minHeight")} onChange={(v) => set("minHeight", v)} placeholder="—" tip="Min Height" />
            <N icon="↔" value={get("maxWidth")} onChange={(v) => set("maxWidth", v)} placeholder="—" tip="Max Width" />
          </div>
        </div>

        {/* ─── Display mode ─── */}
        <div className="flex gap-1 rounded-md border border-sidebar-border p-0.5">
          {(["block", "flex", "grid"] as const).map((t) => (
            <button key={t} onClick={() => {
              set("display", t);
              if (t === "grid" && !get("gridTemplateColumns")) set("gridTemplateColumns", "1fr 1fr");
              if (t === "flex" && !get("flexDirection")) set("flexDirection", "column");
            }} className={cn("flex-1 h-5 rounded-md text-[10px] font-medium capitalize transition-colors", display === t || (t === "block" && !isFlex && !isGrid) ? "bg-primary text-primary-foreground" : "text-muted-foreground/70 hover:text-foreground")}>{t}</button>
          ))}
        </div>

        {/* ─── Flex ─── */}
        {isFlex && (<>
          <div className="flex gap-1">
            <div className="flex-1"><IconToggle value={get("flexDirection") || "row"} options={dirOpts} onChange={(v) => set("flexDirection", v)} /></div>
            <Tip label="Wrap"><button onClick={() => set("flexWrap", isWrap ? "nowrap" : "wrap")} className={cn("flex size-8 items-center justify-center rounded-lg border p-0.5 transition-colors shrink-0", isWrap ? "border-primary/30 bg-primary/10 text-primary" : "border-sidebar-border bg-sidebar text-muted-foreground/40 hover:text-foreground")}>
              <MIcon name="wrap_text" size={14} />
            </button></Tip>
          </div>

          {/* 3×3 Alignment + Gap */}
          <div className="flex items-start gap-2">
            <AlignGrid align={get("alignItems") || "stretch"} justify={get("justifyContent") || "flex-start"} isCol={isCol}
              onChange={(a, j) => { set("alignItems", a); set("justifyContent", j); }} />
            <div className="flex-1 space-y-1">
              <N icon="↕" value={strip(get("rowGap") || get("gap"))} onChange={(v) => set("rowGap", px(v))} placeholder="0" tip="Row gap" />
              <N icon="↔" value={strip(get("columnGap") || get("gap"))} onChange={(v) => set("columnGap", px(v))} placeholder="0" tip="Column gap" />
            </div>
          </div>

          {Array.isArray(selected.content) && !isCol && (
            <div>
              <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Children</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => {
                    const cols = selected.content as El[];
                    if (n === cols.length) return;
                    if (n > cols.length) {
                      let u = selected;
                      for (let i = cols.length; i < n; i++) u = { ...u, content: [...(u.content as El[]), { id: crypto.randomUUID(), type: "column", name: `Col ${i + 1}`, styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1" }, content: [] }] };
                      onUpdate(u);
                    } else onUpdate({ ...selected, content: cols.slice(0, n) });
                  }} className={cn("flex-1 h-5 rounded-md border text-[10px] font-medium transition-colors", (selected.content as El[]).length === n ? "bg-primary text-primary-foreground border-primary" : "border-sidebar-border text-muted-foreground/70 hover:text-foreground")}>{n}</button>
                ))}
              </div>
            </div>
          )}
        </>)}

        {/* ─── Grid ─── */}
        {isGrid && (<>
          <div className="flex items-start gap-2">
            <AlignGrid align={get("alignItems") || "stretch"} justify={get("justifyItems") || "stretch"} isCol={false}
              onChange={(a, j) => { set("alignItems", a); set("justifyItems", j); }} />
            <div className="flex-1 space-y-1">
              <N icon="↕" value={strip(get("rowGap") || get("gap"))} onChange={(v) => set("rowGap", px(v))} placeholder="0" tip="Row gap" />
              <N icon="↔" value={strip(get("columnGap") || get("gap"))} onChange={(v) => set("columnGap", px(v))} placeholder="0" tip="Column gap" />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Columns</span>
            <div className="grid grid-cols-4 gap-1 mb-1">
              {[{ l: "1", v: "1fr" }, { l: "2", v: "1fr 1fr" }, { l: "3", v: "1fr 1fr 1fr" }, { l: "1:2", v: "1fr 2fr" }].map(({ l, v }) => (
                <button key={v} onClick={() => set("gridTemplateColumns", v)} className={cn("h-5 rounded-md border text-[10px] font-medium transition-colors", get("gridTemplateColumns") === v ? "bg-primary/10 border-primary/30 text-primary" : "border-sidebar-border text-muted-foreground/40 hover:text-foreground")}>{l}</button>
              ))}
            </div>
            <Input value={get("gridTemplateColumns")} onChange={(e) => set("gridTemplateColumns", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="1fr 1fr" />
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Rows</span>
            <Input value={get("gridTemplateRows")} onChange={(e) => set("gridTemplateRows", e.target.value)} className="h-5 text-[10px] font-mono" placeholder="auto" />
          </div>
        </>)}

        {/* ─── Padding ─── */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] text-muted-foreground/40">Padding</span>
            <div className="flex-1" />
            <Tip label={padLinked ? "Unlink sides" : "Link all sides"}><button onClick={() => setPadLinked(!padLinked)} className={cn("flex size-4 items-center justify-center rounded-md transition-colors", padLinked ? "text-primary" : "text-muted-foreground/40")}>
              <MIcon name={padLinked ? "link" : "link_off"} size={10} />
            </button></Tip>
          </div>
          {padLinked ? (
            <div className="grid grid-cols-2 gap-1">
              <N icon="↕" value={strip(get("paddingTop"))} onChange={(v) => { set("paddingTop", px(v)); set("paddingBottom", px(v)); }} placeholder="0" tip="Vertical" />
              <N icon="↔" value={strip(get("paddingRight"))} onChange={(v) => { set("paddingRight", px(v)); set("paddingLeft", px(v)); }} placeholder="0" tip="Horizontal" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              <N icon="↑" value={strip(get("paddingTop"))} onChange={(v) => set("paddingTop", px(v))} placeholder="0" tip="Top" />
              <N icon="→" value={strip(get("paddingRight"))} onChange={(v) => set("paddingRight", px(v))} placeholder="0" tip="Right" />
              <N icon="↓" value={strip(get("paddingBottom"))} onChange={(v) => set("paddingBottom", px(v))} placeholder="0" tip="Bottom" />
              <N icon="←" value={strip(get("paddingLeft"))} onChange={(v) => set("paddingLeft", px(v))} placeholder="0" tip="Left" />
            </div>
          )}
        </div>

        {/* ─── Margin ─── */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] text-muted-foreground/40">Margin</span>
            <div className="flex-1" />
            <Tip label={marLinked ? "Unlink sides" : "Link all sides"}><button onClick={() => setMarLinked(!marLinked)} className={cn("flex size-4 items-center justify-center rounded-md transition-colors", marLinked ? "text-primary" : "text-muted-foreground/40")}>
              <MIcon name={marLinked ? "link" : "link_off"} size={10} />
            </button></Tip>
          </div>
          {marLinked ? (
            <div className="grid grid-cols-2 gap-1">
              <N icon="↕" value={strip(get("marginTop"))} onChange={(v) => { set("marginTop", px(v)); set("marginBottom", px(v)); }} placeholder="0" tip="Vertical" />
              <N icon="↔" value={strip(get("marginRight"))} onChange={(v) => { set("marginRight", px(v)); set("marginLeft", px(v)); }} placeholder="0" tip="Horizontal" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              <N icon="↑" value={strip(get("marginTop"))} onChange={(v) => set("marginTop", px(v))} placeholder="0" tip="Top" />
              <N icon="→" value={strip(get("marginRight"))} onChange={(v) => set("marginRight", px(v))} placeholder="0" tip="Right" />
              <N icon="↓" value={strip(get("marginBottom"))} onChange={(v) => set("marginBottom", px(v))} placeholder="0" tip="Bottom" />
              <N icon="←" value={strip(get("marginLeft"))} onChange={(v) => set("marginLeft", px(v))} placeholder="0" tip="Left" />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─── Position Menu (split from layout) ───────────────────────

export function PositionMenu({ get, set }: StyleProps) {
  const pos = get("position") || "static";
  const hasPos = pos !== "static" && pos !== "";

  return (
    <Section title="Position" icon="open_with" defaultOpen={hasPos}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Overflow</span>
            <SelectField label="" value={get("overflow") || "visible"} options={selectOptions.overflow} onChange={(v) => set("overflow", v)} />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Position</span>
            <SelectField label="" value={pos} options={selectOptions.position} onChange={(v) => { set("position", v === "static" ? "" : v); if (v === "sticky") set("top", get("top") || "0"); }} />
          </div>
        </div>

        {hasPos && (<>
          <div className="grid grid-cols-2 gap-1">
            <N icon="arrow_upward" tip="Top" value={strip(get("top") || "")} onChange={(v) => set("top", v ? px(v) : "")} />
            <N icon="arrow_forward" tip="Right" value={strip(get("right") || "")} onChange={(v) => set("right", v ? px(v) : "")} />
            <N icon="arrow_downward" tip="Bottom" value={strip(get("bottom") || "")} onChange={(v) => set("bottom", v ? px(v) : "")} />
            <N icon="arrow_back" tip="Left" value={strip(get("left") || "")} onChange={(v) => set("left", v ? px(v) : "")} />
          </div>
          <N icon="layers" tip="Z-Index" value={get("zIndex") || ""} onChange={(v) => set("zIndex", v || "")} />
        </>)}
      </div>
    </Section>
  );
}
