"use client"

import { Component, type ReactNode, useSyncExternalStore, useCallback, createElement } from "react"
import { BreakpointProvider, useBreakpoint, type Breakpoint } from "@/features/editor/breakpoint-context"
import { AnimationWrapper } from "@/features/editor/components/animation-wrapper"
import { StoreThemeProvider } from "./theme-provider"
import type { AnimationConfig } from "@/features/editor/components/animation-control"
import { resolver } from "@/features/editor/resolver"

// Types for the serialized Craft.js JSON
interface CraftNode {
  type: { resolvedName: string }
  props: Record<string, unknown>
  nodes?: string[]
  linkedNodes?: Record<string, string>
  isCanvas?: boolean
  parent?: string
}

type CraftTree = Record<string, CraftNode>

const ANIM_DEFAULTS: AnimationConfig = { entrance: "none", hover: "none", duration: 500, delay: 0 }

const resolverMap = resolver as unknown as Record<string, React.ComponentType<Record<string, unknown>>>

// ---------------------------------------------------------------------------
// Viewport breakpoint (same logic as original, no Craft.js dependency)
// ---------------------------------------------------------------------------
function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop"
  const w = window.innerWidth
  if (w < 640) return "mobile"
  if (w < 1024) return "tablet"
  return "desktop"
}

function useViewportBreakpoint(): Breakpoint {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("resize", cb)
    return () => window.removeEventListener("resize", cb)
  }, [])
  return useSyncExternalStore(subscribe, getBreakpoint, () => "desktop" as Breakpoint)
}

// ---------------------------------------------------------------------------
// Render a single node + its children by walking the JSON tree
// ---------------------------------------------------------------------------
function RenderNode({ nodeId, tree, breakpoint }: { nodeId: string; tree: CraftTree; breakpoint: Breakpoint }) {
  const node = tree[nodeId]
  if (!node) return null

  const Comp = resolverMap[node.type.resolvedName]
  if (!Comp) return null

  const baseProps = { ...node.props }

  // Apply responsive overrides
  const bp = breakpoint !== "desktop" ? (baseProps._responsive as Record<string, Record<string, unknown>>)?.[breakpoint] ?? {} : {}
  const mergedProps = { ...baseProps, ...bp }

  // Extract layout props
  const animation: AnimationConfig = { ...ANIM_DEFAULTS, ...(baseProps._animation as Partial<AnimationConfig>) }
  const width = (bp._width ?? baseProps._width ?? null) as number | null
  const height = (bp._height ?? baseProps._height ?? null) as number | null
  const spacing = {
    marginTop: (bp.marginTop ?? baseProps.marginTop ?? 0) as number,
    marginRight: (bp.marginRight ?? baseProps.marginRight ?? 0) as number,
    marginBottom: (bp.marginBottom ?? baseProps.marginBottom ?? 0) as number,
    marginLeft: (bp.marginLeft ?? baseProps.marginLeft ?? 0) as number,
    paddingTop: (bp.paddingTop ?? baseProps.paddingTop ?? 0) as number,
    paddingRight: (bp.paddingRight ?? baseProps.paddingRight ?? 0) as number,
    paddingBottom: (bp.paddingBottom ?? baseProps.paddingBottom ?? 0) as number,
    paddingLeft: (bp.paddingLeft ?? baseProps.paddingLeft ?? 0) as number,
  }

  // Render children (nodes[] for canvas children, linkedNodes for named slots)
  const childIds = node.nodes ?? []
  const linkedIds = node.linkedNodes ? Object.values(node.linkedNodes) : []
  const allChildIds = [...childIds, ...linkedIds]
  const children = allChildIds.length > 0
    ? allChildIds.map((id) => <RenderNode key={id} nodeId={id} tree={tree} breakpoint={breakpoint} />)
    : undefined

  // Build the component element
  let content = createElement(Comp, mergedProps, children)

  // Wrap with animation if needed
  const hasAnimation = animation.entrance !== "none" || animation.hover !== "none"
  if (hasAnimation) {
    content = <AnimationWrapper animation={animation}>{content}</AnimationWrapper>
  }

  // Wrap with spacing/sizing if needed
  const hasSpacing = Object.values(spacing).some((v) => v > 0)
  const hasSize = width !== null || height !== null
  if (!hasSpacing && !hasSize) return content

  return (
    <div style={{
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      marginTop: spacing.marginTop || undefined,
      marginRight: spacing.marginRight || undefined,
      marginBottom: spacing.marginBottom || undefined,
      marginLeft: spacing.marginLeft || undefined,
      paddingTop: spacing.paddingTop || undefined,
      paddingRight: spacing.paddingRight || undefined,
      paddingBottom: spacing.paddingBottom || undefined,
      paddingLeft: spacing.paddingLeft || undefined,
    }}>
      {content}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component — replaces <Editor enabled={false}><Frame json={...}/></Editor>
// ---------------------------------------------------------------------------
function StorefrontLite({ craftJson, theme }: { craftJson: string; theme?: import("./theme-provider").StoreTheme }) {
  const breakpoint = useViewportBreakpoint()

  let tree: CraftTree
  try {
    tree = JSON.parse(craftJson) as CraftTree
  } catch {
    return null
  }

  // Find the root node's first child (skip the ROOT wrapper)
  const rootNode = tree["ROOT"]
  if (!rootNode) return null
  const rootChildIds = rootNode.nodes ?? []

  const content = (
    <StorefrontErrorBoundary>
      <BreakpointProvider value={breakpoint}>
        {rootChildIds.map((id) => (
          <RenderNode key={id} nodeId={id} tree={tree} breakpoint={breakpoint} />
        ))}
      </BreakpointProvider>
    </StorefrontErrorBoundary>
  )

  if (!theme || Object.keys(theme).length === 0) return content
  return <StoreThemeProvider theme={theme}>{content}</StoreThemeProvider>
}

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------
class StorefrontErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
          <div>
            <p className="text-lg font-medium text-foreground">Unable to load storefront</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The page layout may be corrupted. Please re-edit in the storefront editor.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export { StorefrontLite }
