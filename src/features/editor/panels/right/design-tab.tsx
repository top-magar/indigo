"use client";

import type { El } from "../../core/types";
import type { StyleProps } from "./shared";
import { Section, SelectField, IconToggle } from "./shared";
import { N } from "./menus/measures-menu";
import { MeasuresMenu, RadiusMenu, FillMenu, StrokeMenu, ShadowMenu, BlurMenu, TypographyMenu, LayoutMenu } from "./menus";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MIcon } from "../../ui/m-icon";

const textTypes = new Set(["text","heading","subheading","quote","code","list","badge","icon","footer","button","link","navbar"]);
const simpleTypes = new Set(["divider","spacer"]);
const imageTypes = new Set(["image","video","gallery"]);

export default function DesignTab({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const type = selected.type;
  const isSimple = simpleTypes.has(type);
  const isBody = type === "__body";
  const isText = textTypes.has(type);
  const isImage = imageTypes.has(type);
  const parentDisplay = ""; // TODO: detect parent's display for flex child controls
  const isFlexChild = false; // TODO: detect if parent is flex/grid

  return (
    <TooltipProvider delayDuration={200}>
    <div className="flex-1 overflow-y-auto">
      {/* ─── Size ─── */}
      {!isSimple && <MeasuresMenu get={get} set={set} />}

      {/* ─── Aspect Ratio (images + containers) ─── */}
      {!isSimple && !isBody && (
        <Section title="Aspect Ratio" icon="aspect_ratio" defaultOpen={false}>
          <div className="flex gap-1">
            {["auto", "1/1", "16/9", "4/3", "3/2", "21/9"].map(r => (
              <button key={r} onClick={() => set("aspectRatio", r === "auto" ? "" : r)}
                className={`flex-1 h-6 rounded text-[9px] font-medium transition-colors ${(get("aspectRatio") || "auto") === (r === "auto" ? "" : r) ? "bg-foreground text-background" : "text-muted-foreground/50 hover:text-foreground hover:bg-muted"}`}>
                {r}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ─── Object Fit (images) ─── */}
      {isImage && (
        <Section title="Fit" icon="crop" defaultOpen>
          <SelectField label="" value={get("objectFit") || "cover"} options={["cover", "contain", "fill", "none", "scale-down"]} onChange={(v) => set("objectFit", v)} />
        </Section>
      )}

      {/* ─── Radius ─── */}
      {!isSimple && !isBody && <RadiusMenu get={get} set={set} />}

      {/* ─── Layout (flex/grid/padding/margin/position) ─── */}
      {!isSimple && <LayoutMenu get={get} set={set} selected={selected} onUpdate={onUpdate} />}

      {/* ─── Typography ─── */}
      {isText && <TypographyMenu get={get} set={set} />}

      {/* ─── Text Overflow (text elements) ─── */}
      {isText && (
        <Section title="Text Overflow" icon="wrap_text" defaultOpen={false}>
          <div className="space-y-1.5">
            <SelectField label="" value={get("whiteSpace") || "normal"} options={["normal", "nowrap", "pre", "pre-wrap", "pre-line"]} onChange={(v) => set("whiteSpace", v === "normal" ? "" : v)} />
            <SelectField label="" value={get("textOverflow") || ""} options={["", "ellipsis", "clip"]} onChange={(v) => set("textOverflow", v)} />
            <SelectField label="" value={get("wordBreak") || ""} options={["", "break-all", "break-word", "keep-all"]} onChange={(v) => set("wordBreak", v)} />
          </div>
        </Section>
      )}

      {/* ─── Fill ─── */}
      {!isSimple && <FillMenu get={get} set={set} />}

      {/* ─── Stroke ─── */}
      {!isSimple && !isBody && <StrokeMenu get={get} set={set} />}

      {/* ─── Shadow ─── */}
      {!isSimple && !isBody && <ShadowMenu get={get} set={set} />}

      {/* ─── Effects (opacity/blur/transform) ─── */}
      {!isSimple && !isBody && <BlurMenu get={get} set={set} />}

      {/* ─── Transition ─── */}
      {!isSimple && !isBody && (
        <Section title="Transition" icon="animation" defaultOpen={false}>
          <div className="space-y-1.5">
            <SelectField label="" value={get("transitionProperty") || ""} options={["", "all", "opacity", "transform", "background-color", "color", "border-color", "box-shadow"]} onChange={(v) => set("transitionProperty", v)} />
            {get("transitionProperty") && (
              <>
                <div className="grid grid-cols-2 gap-1">
                  <N icon="⏱" value={get("transitionDuration")?.replace("ms", "").replace("s", "") || ""} onChange={(v) => set("transitionDuration", v ? `${v}ms` : "")} placeholder="300" tip="Duration (ms)" slider={{ min: 0, max: 2000 }} />
                  <N icon="⏳" value={get("transitionDelay")?.replace("ms", "").replace("s", "") || ""} onChange={(v) => set("transitionDelay", v ? `${v}ms` : "")} placeholder="0" tip="Delay (ms)" slider={{ min: 0, max: 1000 }} />
                </div>
                <SelectField label="" value={get("transitionTimingFunction") || "ease"} options={["ease", "ease-in", "ease-out", "ease-in-out", "linear"]} onChange={(v) => set("transitionTimingFunction", v)} />
              </>
            )}
          </div>
        </Section>
      )}

      {/* ─── Cursor ─── */}
      {!isSimple && !isBody && (
        <Section title="Cursor" icon="mouse" defaultOpen={false}>
          <div className="flex flex-wrap gap-1">
            {["default", "pointer", "grab", "text", "move", "crosshair", "not-allowed", "wait", "zoom-in", "none"].map(c => (
              <button key={c} onClick={() => set("cursor", c === "default" ? "" : c)}
                className={`h-6 px-2 rounded text-[9px] font-medium transition-colors ${(get("cursor") || "default") === c ? "bg-foreground text-background" : "text-muted-foreground/40 hover:text-foreground hover:bg-muted"}`}
                style={{ cursor: c }}>
                {c}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ─── Advanced ─── */}
      {!isSimple && !isBody && (
        <Section title="Advanced" icon="tune" defaultOpen={false}>
          <div className="space-y-1.5">
            <SelectField label="" value={get("visibility") || "visible"} options={["visible", "hidden"]} onChange={(v) => set("visibility", v === "visible" ? "" : v)} />
            <SelectField label="" value={get("pointerEvents") || "auto"} options={["auto", "none"]} onChange={(v) => set("pointerEvents", v === "auto" ? "" : v)} />
            <SelectField label="" value={get("userSelect") || "auto"} options={["auto", "none", "text", "all"]} onChange={(v) => set("userSelect", v === "auto" ? "" : v)} />
          </div>
        </Section>
      )}
    </div>
    </TooltipProvider>
  );
}
