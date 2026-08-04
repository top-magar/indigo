/**
 * Pure renderer manifests.
 *
 * These lists are imported by the renderer implementations as `Record` key
 * types and by registry-coverage tests. Keeping them dependency-free means
 * tests can audit coverage without importing the full storefront RSC graph
 * (`server-only`, database-backed cart components, etc.).
 *
 * Compiler contract: each renderer map is declared as
 * `Record<...RendererType, Renderer>`, so removing a key from a map fails
 * `tsc`; adding a type here also fails until every implementation exists.
 */

export const CANVAS_RENDERER_TYPES = [
  'text', 'heading', 'subheading', 'link', 'button', 'image', 'video',
  'divider', 'spacer', 'quote', 'badge', 'list', 'code', 'icon',
  'socialIcons', 'map', 'gallery', 'accordion', 'tabs', 'countdown',
  'starRating', 'cartButton',
] as const;
export type CanvasRendererType = (typeof CANVAS_RENDERER_TYPES)[number];

/** Registered types handled explicitly by the live storefront map. */
export const STOREFRONT_REGISTERED_RENDERER_TYPES = [
  '__body', 'heading', 'subheading', 'text', 'badge', 'image', 'divider',
  'link', 'button', 'video', 'spacer', 'quote', 'list', 'code', 'icon',
  'embed', 'socialIcons', 'map', 'gallery', 'accordion', 'tabs',
  'countdown', 'starRating', 'cartButton', 'productGrid',
] as const;

/** Older document aliases handled by the storefront but no longer registered. */
export const STOREFRONT_LEGACY_RENDERER_TYPES = [
  'h1', 'h2', 'h3', 'paragraph', 'label', 'sectionHeading',
  'input', 'textarea', 'addToCart', 'navigation',
] as const;

export const STOREFRONT_RENDERER_TYPES = [
  ...STOREFRONT_REGISTERED_RENDERER_TYPES,
  ...STOREFRONT_LEGACY_RENDERER_TYPES,
] as const;
export type StorefrontRendererType = (typeof STOREFRONT_RENDERER_TYPES)[number];

export const EXPORT_RENDERER_TYPES = [
  'text', 'heading', 'subheading', 'link', 'button', 'image', 'video',
  'divider', 'spacer', 'icon', 'badge', 'quote', 'list', 'code', 'embed',
  'map', 'gallery', 'socialIcons', 'accordion', 'tabs', 'countdown',
  'starRating', 'cartButton', 'navbar', 'header', 'footer', 'section',
  'contactForm',
] as const;
export type ExportRendererType = (typeof EXPORT_RENDERER_TYPES)[number];
