import type { CSSProperties } from "react";

export type Device = "Desktop" | "Tablet" | "Mobile";

export type El = {
  id: string;
  type: string;
  name: string;
  styles: CSSProperties;
  /** Per-device style overrides. Merged on top of `styles` when viewing that device. */
  responsiveStyles?: Partial<Record<Device, CSSProperties>>;
  content: El[] | Record<string, string>;
  /** Data binding — connects content to a product field */
  binding?: { source: 'product'; field: string; productId?: string };
  /** Repeat children for each product in a collection */
  repeat?: { source: 'products'; collectionId?: string; limit?: number };
  /** Prevent editing/moving */
  locked?: boolean;
  /** Hide from canvas (still in tree) */
  hidden?: boolean;
};

/** Resolve styles for a given device: base styles + device overrides */
export function resolveStyles(el: El, device: Device): CSSProperties {
  if (!el.responsiveStyles) return el.styles;
  // Desktop = base styles only. Tablet/Mobile = base + overrides.
  if (device === "Desktop") return el.styles;
  return { ...el.styles, ...el.responsiveStyles[device] };
}

export type EditorProps = {
  pageId: string;
  pageName: string;
  tenantId: string;
  userId: string;
  initialContent: string | null;
  activePageId?: string | null;
  activePageName?: string;
  themeConfig?: Record<string, string> | null;
};
