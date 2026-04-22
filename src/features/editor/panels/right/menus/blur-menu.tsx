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
        <N icon="opacity" value={opacity ? String(Math.round(parseFloat(opacity) * 100)) : "100"} onChange={(v) => set("opacity", String((+v || 0) / 100))} placeholder="100" tip="Opacity %" slider={{ min: 0, max: 100, gradient: "linear-gradient(to right, transparent, #000)" }} />

        {/* Blend mode */}
        <SelectField label="" value={get("mixBlendMode") || "normal"} options={blendModes} onChange={(v) => set("mixBlendMode", v === "normal" ? "" : v)} />

        {/* Blur + Backdrop blur */}
        <N icon="blur_on" value={parseFilter(get("filter"), "blur")} onChange={(v) => setFilter(get, set, "blur", v, "px")} placeholder="0" tip="Blur" slider={{ min: 0, max: 20, gradient: "linear-gradient(to right, #3b82f6, #93c5fd)" }} />
        <N icon="blur_circular" value={get("backdropFilter")?.replace("blur(", "").replace("px)", "").replace(")", "") || ""} onChange={(v) => set("backdropFilter", v && v !== "0" ? `blur(${v}px)` : "")} placeholder="0" tip="Backdrop blur" slider={{ min: 0, max: 20, gradient: "linear-gradient(to right, #8b5cf6, #c4b5fd)" }} />

        {/* Brightness + Contrast */}
        <N icon="light_mode" value={parseFilter(get("filter"), "brightness") || ""} onChange={(v) => setFilter(get, set, "brightness", v, "%")} placeholder="100" tip="Brightness %" slider={{ min: 0, max: 200, gradient: "linear-gradient(to right, #1a1a1a, #fbbf24, #fff)" }} />
        <N icon="contrast" value={parseFilter(get("filter"), "contrast") || ""} onChange={(v) => setFilter(get, set, "contrast", v, "%")} placeholder="100" tip="Contrast %" slider={{ min: 0, max: 200, gradient: "linear-gradient(to right, #9ca3af, #111)" }} />

        {/* Saturate + Grayscale */}
        <N icon="palette" value={parseFilter(get("filter"), "saturate") || ""} onChange={(v) => setFilter(get, set, "saturate", v, "%")} placeholder="100" tip="Saturate %" slider={{ min: 0, max: 200, gradient: "linear-gradient(to right, #9ca3af, #ef4444, #f97316)" }} />
        <N icon="filter_b_and_w" value={parseFilter(get("filter"), "grayscale") || ""} onChange={(v) => setFilter(get, set, "grayscale", v, "%")} placeholder="0" tip="Grayscale %" slider={{ min: 0, max: 100, gradient: "linear-gradient(to right, #ef4444, #9ca3af)" }} />

        {/* Hue rotate */}
        <N icon="color_lens" value={parseFilter(get("filter"), "hue-rotate") || ""} onChange={(v) => setFilter(get, set, "hue-rotate", v, "deg")} placeholder="0" tip="Hue rotate deg" slider={{ min: 0, max: 360, gradient: "linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)" }} />

        {/* ─── Transform ─── */}
        <div className="pt-1 border-t border-sidebar-border/50">
          <span className="text-[10px] text-muted-foreground/40 mb-0.5 block">Transform</span>
          <div className="space-y-1">
            <N icon="rotate_right" value={get("rotate")?.replace("deg", "") || ""} onChange={(v) => set("rotate", v && v !== "0" ? `${v}deg` : "")} placeholder="0" tip="Rotate (deg)" slider={{ min: -180, max: 180 }} />
            <N icon="zoom_out_map" value={get("scale") || ""} onChange={(v) => set("scale", v && v !== "1" ? v : "")} placeholder="1" tip="Scale" slider={{ min: 0, max: 3 }} />
            <div className="grid grid-cols-2 gap-1">
              <N icon="swap_horiz" value={get("translateX")?.replace("px", "") || ""} onChange={(v) => set("translateX", v && v !== "0" ? `${v}px` : "")} placeholder="0" tip="Translate X" />
              <N icon="swap_vert" value={get("translateY")?.replace("px", "") || ""} onChange={(v) => set("translateY", v && v !== "0" ? `${v}px` : "")} placeholder="0" tip="Translate Y" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
