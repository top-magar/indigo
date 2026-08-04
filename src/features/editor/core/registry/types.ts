import type { ComponentType, ReactNode } from 'react';
import type { El, StorefrontProduct } from '../types';

/** Data available to an element when rendered on the live storefront. */
export type StorefrontElementContext = {
  store: { name: string; slug: string };
  currency: string;
  products: StorefrontProduct[];
  collections?: Record<string, string[]>;
  navigation?: Array<{ id: string; label: string; href: string }>;
  cart?: { itemCount: number };
  activeProduct?: StorefrontProduct;
  activeCollection?: { id: string; name: string; description?: string | null };
};

export type StorefrontRenderProps = {
  element: El;
  context: StorefrontElementContext;
  mode: 'canvas' | 'preview' | 'live';
  product?: StorefrontProduct;
};

export type ElementDef = {
  type: string;
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  group: string;
  isContainer: boolean;
  factory: () => El;
  /** Canvas renderer (client component with editing affordances). Falls back to the shared canvas renderers map. */
  render?: ComponentType<{ element: El }>;
  /** Live storefront renderer (server-safe — no hooks, RSC compatible). Falls back to the shared storefront map. */
  storefrontRender?: (props: StorefrontRenderProps) => ReactNode;
  /** Static HTML export for this element type. Falls back to the shared export map. */
  exportHTML?: (el: El) => string;
  pluginProps?: Record<string, any>;
};

export const registry = new Map<string, ElementDef>();

export function register(def: ElementDef) { registry.set(def.type, def); }

/** Registered element types, keyed by type string. */
export function getRegisteredTypes(): string[] { return [...registry.keys()]; }

/** Leaf (non-container) types — these must render through the per-path renderer maps. */
export function getRegisteredLeafTypes(): string[] {
  return [...registry.values()].filter((def) => !def.isContainer).map((def) => def.type);
}
