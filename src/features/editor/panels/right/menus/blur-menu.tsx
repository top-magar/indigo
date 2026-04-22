"use client";


import { Section, SelectField, type StyleProps } from "../shared";
import { N } from "./measures-menu";

function parseFilter(val: string, fn: string): string {
  const m = val.match(new RegExp(`${fn}\\(([^)]+)\\)`));
  return m ? m[1].replace(/px|%|deg/g, "") : "";
}

function setFilter(get: (p: string) => string, set: (p: string, v: string) => void, fn: string, val: string, unit: string) {
  const current = get("filter") || "";
  const cleaned = current.replace(new RegExp(`${fn}\\([^)]*\\)\\s*`), "").trim();
  const next = val && val !== "0" ? `${cleaned} ${fn}(${val}${unit})`.trim() : cleaned;
  set("filter", next || "");
}

const blendModes = ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"];

export function BlurMenu({ get, set }: StyleProps) {
  const opacity = get("opacity");

  return (
    <Section title="Effects" icon="auto_awesome" defaultOpen={false}>
      <div className="space-y-1">
        {/* Opacity */}
        <N icon="Op" value={opacity ? String(Math.round(parseFloat(opacity) * 100)) : "100"} onChange={(v) => set("opacity", String((+v || 0) / 100))} placeholder="100" tip="Opacity %" slider={{ min: 0, max: 100 }} />

        {/* Blend mode */}
        <SelectField label="" value={get("mixBlendMode") || "normal"} options={blendModes} onChange={(v) => set("mixBlendMode", v === "normal" ? "" : v)} />

        {/* Blur + Backdrop blur */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="B" value={parseFilter(get("filter"), "blur")} onChange={(v) => setFilter(get, set, "blur", v, "px")} placeholder="0" tip="Blur" slider={{ min: 0, max: 20 }} />
          <N icon="⬚" value={get("backdropFilter")?.replace("blur(", "").replace("px)", "").replace(")", "") || ""} onChange={(v) => set("backdropFilter", v && v !== "0" ? `blur(${v}px)` : "")} placeholder="0" tip="Backdrop blur" slider={{ min: 0, max: 20 }} />
        </div>

        {/* Brightness + Contrast */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="☀" value={parseFilter(get("filter"), "brightness") || ""} onChange={(v) => setFilter(get, set, "brightness", v, "%")} placeholder="100" tip="Brightness %" slider={{ min: 0, max: 200 }} />
          <N icon="◐" value={parseFilter(get("filter"), "contrast") || ""} onChange={(v) => setFilter(get, set, "contrast", v, "%")} placeholder="100" tip="Contrast %" slider={{ min: 0, max: 200 }} />
        </div>

        {/* Saturate + Grayscale */}
        <div className="grid grid-cols-2 gap-1">
          <N icon="Sa" value={parseFilter(get("filter"), "saturate") || ""} onChange={(v) => setFilter(get, set, "saturate", v, "%")} placeholder="100" tip="Saturate %" slider={{ min: 0, max: 200 }} />
          <N icon="◑" value={parseFilter(get("filter"), "grayscale") || ""} onChange={(v) => setFilter(get, set, "grayscale", v, "%")} placeholder="0" tip="Grayscale %" slider={{ min: 0, max: 100 }} />
        </div>

        {/* Hue rotate */}
        <N icon="Hu" value={parseFilter(get("filter"), "hue-rotate") || ""} onChange={(v) => setFilter(get, set, "hue-rotate", v, "deg")} placeholder="0" tip="Hue rotate deg" slider={{ min: 0, max: 360 }} />

        {/* ─── Transform ─── */}
        <div className="pt-1 border-t border-sidebar-border/50 mt-1">
          <span className="text-[9px] text-muted-foreground/40 mb-1 block">Transform</span>
          <div className="grid grid-cols-2 gap-1">
            <N icon="↻" value={get("rotate")?.replace("deg", "") || ""} onChange={(v) => set("rotate", v && v !== "0" ? `${v}deg` : "")} placeholder="0" tip="Rotate (deg)" slider={{ min: -180, max: 180 }} />
            <N icon="Sc" value={get("scale") || ""} onChange={(v) => set("scale", v && v !== "1" ? v : "")} placeholder="1" tip="Scale" slider={{ min: 0, max: 3 }} />
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <N icon="Tx" value={get("translateX")?.replace("px", "") || ""} onChange={(v) => set("translateX", v && v !== "0" ? `${v}px` : "")} placeholder="0" tip="Translate X" />
            <N icon="Ty" value={get("translateY")?.replace("px", "") || ""} onChange={(v) => set("translateY", v && v !== "0" ? `${v}px` : "")} placeholder="0" tip="Translate Y" />
          </div>
        </div>
      </div>
    </Section>
  );
}
