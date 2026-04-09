/**
 * Shared Renderer — Decouples storefront from editor internals.
 *
 * Re-exports only what the storefront needs to render pages.
 * When the storefront is split into a separate deployment,
 * this module becomes the boundary — copy it to the new repo.
 *
 * Editor imports from @/features/editor directly.
 * Storefront imports from @/shared/renderer.
 */

// Block resolver — maps block type names to React components
export { resolver } from "@/features/editor/resolver";

// Responsive breakpoints for storefront rendering
export {
  BreakpointProvider,
  useBreakpoint,
  type Breakpoint,
} from "@/features/editor/breakpoint-context";

// Animation wrapper for block enter/scroll animations
export { AnimationWrapper } from "@/features/editor/canvas/animation-wrapper";
export type { AnimationConfig } from "@/features/editor/controls/animation-control";

// Theme → CSS variables converter
export { themeToVars } from "@/features/editor/lib/theme-to-vars";
