/**
 * Lazy Loading Utilities
 * 
 * Provides dynamic imports for heavy client components to improve initial load performance.
 * Uses next/dynamic for code splitting with SSR control.
 * 
 * @see https://nextjs.org/docs/app/guides/lazy-loading
 */

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// =============================================================================
// LOADING SKELETONS
// =============================================================================

function EditorLoadingSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Header skeleton */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 grid grid-cols-[240px_1fr_280px]">
        <div className="border-r p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="p-8">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="border-l p-4 space-y-4">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

function GalleryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </div>
  )
}

function VideoLoadingSkeleton() {
  return (
    <div className="relative">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    </div>
  )
}

function RichTextEditorLoadingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-32 w-full rounded" />
    </div>
  )
}

// =============================================================================
// LAZY LOADED COMPONENTS
// =============================================================================

/**
 * Lazy loaded Visual Editor
 * Heavy component with many dependencies - only load when needed in editor routes
 */
export const LazyVisualEditor = dynamic(
  () => import("@/app/(editor)/storefront/visual-editor").then((mod) => mod.VisualEditor),
  {
    loading: () => <EditorLoadingSkeleton />,
    ssr: false, // Editor is client-only
  }
)

/**
 * Lazy loaded Gallery Block
 * Contains lightbox functionality - defer loading until needed
 */
export const LazyGalleryBlock = dynamic(
  () => import("@/components/store/blocks/gallery").then((mod) => mod.GalleryBlock),
  {
    loading: () => <GalleryLoadingSkeleton />,
  }
)

/**
 * Lazy loaded Video Block
 * Video player can be heavy - defer loading
 */
export const LazyVideoBlock = dynamic(
  () => import("@/components/store/blocks/video").then((mod) => mod.VideoBlock),
  {
    loading: () => <VideoLoadingSkeleton />,
  }
)

/**
 * Lazy loaded Rich Text Editor (TipTap)
 * Heavy library - only load when user starts editing
 */
export const LazyEditableRichText = dynamic(
  () => import("@/components/store/blocks/rich-text-editor/editable-rich-text").then((mod) => mod.EditableRichText),
  {
    loading: () => <RichTextEditorLoadingSkeleton />,
    ssr: false, // Editor is client-only
  }
)

/**
 * Lazy loaded Countdown Block
 * Uses intervals and date calculations - defer loading
 */
export const LazyCountdownBlock = dynamic(
  () => import("@/components/store/blocks/countdown").then((mod) => mod.CountdownBlock),
  {
    loading: () => <Skeleton className="h-24 w-full rounded-lg" />,
  }
)

// =============================================================================
// LAZY LOAD EXTERNAL LIBRARIES
// =============================================================================

/**
 * Lazy load heavy external libraries on demand
 * Use these functions to load libraries only when needed
 * 
 * Example usage:
 * const dateFns = await loadDateFns()
 * const formatted = dateFns.format(new Date(), 'PPP')
 */

export async function loadDateFns() {
  return import("date-fns")
}

// =============================================================================
// PRELOAD UTILITIES
// =============================================================================

/**
 * Preload a component when you anticipate it will be needed
 * Call this on hover or when user shows intent to use a feature
 * 
 * Example:
 * onMouseEnter={() => preloadComponent('visual-editor')}
 */
export function preloadComponent(component: 'visual-editor' | 'gallery' | 'video' | 'rich-text-editor') {
  switch (component) {
    case 'visual-editor':
      import("@/app/(editor)/storefront/visual-editor")
      break
    case 'gallery':
      import("@/components/store/blocks/gallery")
      break
    case 'video':
      import("@/components/store/blocks/video")
      break
    case 'rich-text-editor':
      import("@/components/store/blocks/rich-text-editor/editable-rich-text")
      break
  }
}
