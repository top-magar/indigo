"use client";

import type { El } from "../../core/types";
import type { StyleProps } from "./shared";
import { Section, SelectField } from "./shared";
import { RadiusMenu, FillMenu, StrokeMenu, ShadowMenu, BlurMenu, TypographyMenu, LayoutMenu, PositionMenu } from "./menus";

const textTypes = new Set(["text","heading","subheading","quote","code","list","badge","icon","footer","button","link","navbar"]);
const simpleTypes = new Set(["divider","spacer"]);
const imageTypes = new Set(["image","video","gallery"]);

export default function DesignTab({ get, set, selected, onUpdate }: StyleProps & { selected: El; onUpdate: (el: El) => void }) {
  const type = selected.type;
  const isSimple = simpleTypes.has(type);
  const isBody = type === "__body";
  const isText = textTypes.has(type);
  const isImage = imageTypes.has(type);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 1. Layout (size + display + alignment + gap + padding + margin) */}
      {!isSimple && <LayoutMenu get={get} set={set} selected={selected} onUpdate={onUpdate} />}

      {/* 2. Position (overflow + position + offsets + z-index) */}
      {!isSimple && !isBody && <PositionMenu get={get} set={set} />}

      {/* 3. Radius */}
      {!isSimple && !isBody && <RadiusMenu get={get} set={set} />}

      {/* 4. Object Fit — images/video */}
      {isImage && (
        <Section title="Fit" icon="crop" defaultOpen>
          <SelectField label="" value={get("objectFit") || "cover"} options={["cover", "contain", "fill", "none", "scale-down"]} onChange={(v) => set("objectFit", v)} />
        </Section>
      )}

      {/* 5. Typography */}
      {isText && <TypographyMenu get={get} set={set} />}

      {/* 6. Text Overflow */}
      {isText && (
        <Section title="Text Overflow" icon="wrap_text" defaultOpen={false}>
          <div className="space-y-1.5">
            <SelectField label="White Space" value={get("whiteSpace") || "normal"} options={["normal", "nowrap", "pre", "pre-wrap"]} onChange={(v) => set("whiteSpace", v === "normal" ? "" : v)} />
            <SelectField label="Overflow" value={get("textOverflow") || "none"} options={["none", "ellipsis", "clip"]} onChange={(v) => set("textOverflow", v === "none" ? "" : v)} />
          </div>
        </Section>
      )}

      {/* 7. Fill */}
      {!isSimple && <FillMenu get={get} set={set} />}

      {/* 8. Stroke */}
      {!isSimple && !isBody && <StrokeMenu get={get} set={set} />}

      {/* 9. Shadow */}
      {!isSimple && !isBody && <ShadowMenu get={get} set={set} />}

      {/* 10. Effects (opacity/blur/transform) */}
      {!isSimple && !isBody && <BlurMenu get={get} set={set} />}
    </div>
  );
}
