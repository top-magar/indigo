/**
 * Registry renderer coverage tests.
 *
 * Renderer implementations are compile-time constrained to the pure manifests:
 *   `Record<CanvasRendererType, ...>`
 *   `Record<StorefrontRendererType, ...>`
 *   `Record<ExportRendererType, ...>`
 *
 * This test verifies the other direction: every registered leaf element appears
 * in those manifests or supplies a renderer directly on its ElementDef. The
 * test deliberately avoids importing the storefront RSC runtime graph, which
 * includes `server-only` modules and cannot run under Vitest's jsdom worker.
 */

import { describe, it, expect } from 'vitest';
import './server-bootstrap';
import {
  CANVAS_RENDERER_TYPES,
  STOREFRONT_REGISTERED_RENDERER_TYPES,
  EXPORT_RENDERER_TYPES,
} from './renderer-manifests';
import { getRegisteredLeafTypes, registry } from './types';

/** Leaf types that intentionally lack static export because they depend on
 * runtime commerce data unavailable to a standalone HTML file. */
const EXPORT_DATA_DEPENDENT = new Set([
  'productGrid', 'addToCart', 'productCard', 'priceTag',
]);

describe('element registry', () => {
  it('has at least one registered type', () => {
    expect(registry.size).toBeGreaterThan(0);
  });

  it('every registered type has a valid factory', () => {
    for (const [type, def] of registry) {
      try {
        const el = def.factory();
        expect(el.id).toBeTruthy();
        expect(el.type).toBe(type);
        expect(el.name).toBeTruthy();
        expect(el.styles).toBeDefined();
      } catch (err) {
        throw new Error(`factory() threw for type "${type}": ${err}`);
      }
    }
  });
});

describe('renderer coverage', () => {
  const canvasHandled = new Set<string>(CANVAS_RENDERER_TYPES);
  const storefrontHandled = new Set<string>(STOREFRONT_REGISTERED_RENDERER_TYPES);
  const exportHandled = new Set<string>(EXPORT_RENDERER_TYPES);

  it('canvas manifest contains only registered element types', () => {
    const unknown = [...canvasHandled].filter((type) => !registry.has(type));
    expect(unknown, `Canvas manifest contains unregistered types: ${unknown.join(', ')}`).toEqual([]);
  });

  it('storefront manifest contains only registered element types', () => {
    const unknown = [...storefrontHandled].filter((type) => type !== '__body' && !registry.has(type));
    expect(unknown, `Storefront manifest contains unregistered types: ${unknown.join(', ')}`).toEqual([]);
  });

  it('every registered leaf type has a canvas renderer', () => {
    const missing = getRegisteredLeafTypes().filter((type) => {
      const def = registry.get(type)!;
      return !canvasHandled.has(type) && !def.render;
    });
    expect(missing, `Leaf types missing canvas renderers: ${missing.join(', ')}`).toEqual([]);
  });

  it('every registered leaf type has a storefront renderer', () => {
    const missing = getRegisteredLeafTypes().filter((type) => {
      const def = registry.get(type)!;
      return !storefrontHandled.has(type) && !def.storefrontRender;
    });
    expect(missing, `Leaf types missing storefront renderers: ${missing.join(', ')}`).toEqual([]);
  });

  it('every registered leaf type has a static export renderer or explicit exclusion', () => {
    const missing = getRegisteredLeafTypes().filter((type) => {
      if (EXPORT_DATA_DEPENDENT.has(type)) return false;
      const def = registry.get(type)!;
      return !exportHandled.has(type) && !def.exportHTML;
    });
    expect(missing, `Leaf types missing export renderers: ${missing.join(', ')}`).toEqual([]);
  });

  it('every canvas-rendered leaf is also handled by storefront', () => {
    const mismatches = getRegisteredLeafTypes().filter((type) => {
      const def = registry.get(type)!;
      const inCanvas = canvasHandled.has(type) || !!def.render;
      const inStorefront = storefrontHandled.has(type) || !!def.storefrontRender;
      return inCanvas && !inStorefront;
    });
    expect(mismatches, `Leaf types in canvas but not storefront: ${mismatches.join(', ')}`).toEqual([]);
  });
});
