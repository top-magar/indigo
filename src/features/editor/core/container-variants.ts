import type { CSSProperties } from "react";

export const containerVariants: Record<string, { label: string; icon: string; styles: CSSProperties }> = {
  stack:   { label: "Stack",   icon: "view_agenda",       styles: { display: "flex", flexDirection: "column", gap: "16px" } },
  row:     { label: "Row",     icon: "view_column",       styles: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "16px", alignItems: "center" } },
  grid:    { label: "Grid",    icon: "grid_view",         styles: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" } },
  center:  { label: "Center",  icon: "center_focus_weak", styles: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" } },
  sidebar: { label: "Sidebar", icon: "view_sidebar",      styles: { display: "grid", gridTemplateColumns: "250px 1fr", gap: "24px" } },
  split:   { label: "Split",   icon: "vertical_split",    styles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center" } },
};

/** Style keys that variants control — cleared before applying a new variant */
export const variantKeys = [
  "display", "flexDirection", "flexWrap", "alignItems", "justifyContent",
  "gap", "gridTemplateColumns", "textAlign",
] as const;
