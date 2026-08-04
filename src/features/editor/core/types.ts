import type { CSSProperties } from "react";

import type { EditorBinding, EditorDevice } from "./document-v2";

export type Device = EditorDevice;

export type El = {
  id: string;
  type: string;
  name: string;
  styles: CSSProperties;
  /** Per-device style overrides. Merged on top of `styles` when viewing that device. */
  responsiveStyles?: Partial<Record<Device, CSSProperties>>;
  content: El[] | Record<string, string>;
  /** Data binding — connects content to a product field */
  binding?: EditorBinding;
  /** Repeat children for each product in a collection */
  repeat?: { source: 'collection'; resourceId?: string; limit?: number };
  /** Prevent editing/moving */
  locked?: boolean;
  /** Hide from canvas (still in tree) */
  hidden?: boolean;
};

/** Resolve styles for a given device: base styles + device overrides */
export function resolveStyles(el: El, device: Device): CSSProperties {
  if (!el.responsiveStyles) return el.styles;
  // Desktop = base styles only. Tablet/mobile add overrides.
  if (device === "desktop") return el.styles;
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
  activePageSlug?: string;
  themeConfig?: Record<string, string> | null;
  initialServerRevision?: number;
  initialDocumentVersion?: number;
  siteSlug?: string | null;
  currency?: string;
};
