import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

/**
 * Registration-mark frame — the core of the technical construction grid.
 *
 * Renders four square corner brackets around its children plus optional
 * edge-anchor nodes. Variants:
 *   - gray:   structural frame (section frames, dashboard shell, footer)
 *   - purple: active/selected state (featured pricing plan, primary CTAs)
 *
 * Brackets are drawn with CSS background gradients on ::before/::after so they
 * stay sharp at any size; hover extends them 2–3px (see landing.css).
 * Edge nodes are hidden below 1024px.
 */
export function Frame({
  children,
  variant = "gray",
  nodes = false,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: "gray" | "purple";
  /** Render edge-anchor squares along the left/right frame edges. */
  nodes?: boolean;
  className?: string;
  as?: "div" | "section" | "figure" | "li";
}) {
  return (
    <Tag
      className={cn(
        "lv2-frame",
        variant === "purple" && "lv2-frame--purple",
        className,
      )}
    >
      {children}
      {nodes ? (
        <span className="lv2-frame__nodes" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      ) : null}
    </Tag>
  );
}

/**
 * A single small square anchor node, used along section edges where a
 * registration mark would be too heavy.
 */
export function EdgeNode({ variant = "gray", className }: { variant?: "gray" | "purple"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "lv2-edge-node",
        variant === "purple" && "lv2-edge-node--purple",
        className,
      )}
    />
  );
}
