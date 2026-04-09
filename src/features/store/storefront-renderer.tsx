"use client"

import { Editor, Frame, useNode } from "@craftjs/core"
import { resolver, BreakpointProvider, useBreakpoint, AnimationWrapper, type Breakpoint, type AnimationConfig } from "@/shared/renderer"
import { Component, type ReactNode, cloneElement, useSyncExternalStore, useCallback } from "react"
import { StoreThemeProvider } from "./theme-provider"

const ANIM_DEFAULTS: AnimationConfig = { entrance: "none", hover: "none", trigger: "scroll", duration: 500, delay: 0 }

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

export function StorefrontRenderer({ craftJson, theme }: { craftJson: string; theme?: import("./theme-provider").StoreTheme }) {
  const breakpoint = useViewportBreakpoint()

  const content = (
    <StorefrontErrorBoundary>
      <BreakpointProvider value={breakpoint}>
        <Editor resolver={resolver} enabled={false} onRender={StorefrontRenderNode}>
          <Frame json={craftJson} />
        </Editor>
      </BreakpointProvider>
    </StorefrontErrorBoundary>
  )

  if (!theme || Object.keys(theme).length === 0) return content

  return <StoreThemeProvider theme={theme}>{content}</StoreThemeProvider>
}

const StorefrontRenderNode = ({ render }: { render: React.ReactElement }) => {
  const breakpoint = useBreakpoint()

  const { spacing, responsiveOverrides, animation, nodeWidth, nodeHeight } = useNode((node) => {
    const props = node.data.props ?? {}
    const bp = breakpoint !== "desktop" ? props._responsive?.[breakpoint] ?? {} : {}

    return {
      responsiveOverrides: bp,
      animation: { ...ANIM_DEFAULTS, ...props._animation } as AnimationConfig,
      nodeWidth: bp._width ?? props._width ?? null as number | null,
      nodeHeight: bp._height ?? props._height ?? null as number | null,
      spacing: {
        marginTop: bp.marginTop ?? props.marginTop ?? 0,
        marginRight: bp.marginRight ?? props.marginRight ?? 0,
        marginBottom: bp.marginBottom ?? props.marginBottom ?? 0,
        marginLeft: bp.marginLeft ?? props.marginLeft ?? 0,
        paddingTop: bp.paddingTop ?? props.paddingTop ?? 0,
        paddingRight: bp.paddingRight ?? props.paddingRight ?? 0,
        paddingBottom: bp.paddingBottom ?? props.paddingBottom ?? 0,
        paddingLeft: bp.paddingLeft ?? props.paddingLeft ?? 0,
      },
    }
  })

  const hasSpacing = Object.values(spacing).some((v) => v > 0)
  const hasSize = nodeWidth !== null || nodeHeight !== null
  const hasOverrides = Object.keys(responsiveOverrides).length > 0
  const hasAnimation = animation.entrance !== "none" || animation.hover !== "none"

  let content = hasOverrides ? cloneElement(render, { ...responsiveOverrides }) : render

  if (hasAnimation) {
    content = <AnimationWrapper animation={animation}>{content}</AnimationWrapper>
  }

  if (!hasSpacing && !hasSize) return content

  return (
    <div style={{
      ...(nodeWidth ? { width: nodeWidth } : {}),
      ...(nodeHeight ? { height: nodeHeight } : {}),
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
