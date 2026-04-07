"use client"

import { useNode, useEditor, ROOT_NODE } from "@craftjs/core"
import { cn } from "@/shared/utils"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCallback, cloneElement, useRef, useMemo } from "react"
import { useBreakpoint } from "../breakpoint-context"
import { AnimationWrapper } from "./animation-wrapper"
import { ResizeHandles } from "./resize-handles"
import { ScrollEffectWrapper, type ScrollEffect } from "./scroll-effect-wrapper"
import type { AnimationConfig } from "./animation-control"

const ANIM_DEFAULTS: AnimationConfig = { entrance: "none", hover: "none", trigger: "scroll", duration: 500, delay: 0 }

export const RenderNode = ({ render }: { render: React.ReactElement }) => {
  const breakpoint = useBreakpoint()

  // Return only primitives/strings so Craft.js shallow comparison works — no new objects per render
  const {
    id, isSelected, displayName, isDeletable, isHiddenOnBreakpoint,
    // Serialized as strings for stable comparison
    _spacingKey, _designKey, _animKey, _overridesKey,
    scrollEffect, stickyMode, widthMode, nodeWidth, nodeHeight,
  } = useNode((node) => {
    const props = node.data.props ?? {}
    const responsive = props._responsive ?? {}
    const bp = breakpoint !== "desktop" ? responsive[breakpoint] ?? {} : {}
    const hiddenMap: Record<string, string> = { desktop: "hideOnDesktop", tablet: "hideOnTablet", mobile: "hideOnMobile" }
    const hideKey = hiddenMap[breakpoint]

    const mt = bp.marginTop ?? props.marginTop ?? 0
    const mr = bp.marginRight ?? props.marginRight ?? 0
    const mb = bp.marginBottom ?? props.marginBottom ?? 0
    const ml = bp.marginLeft ?? props.marginLeft ?? 0
    const pt = bp.paddingTop ?? props.paddingTop ?? 0
    const pr = bp.paddingRight ?? props.paddingRight ?? 0
    const pb = bp.paddingBottom ?? props.paddingBottom ?? 0
    const pl = bp.paddingLeft ?? props.paddingLeft ?? 0

    const shadow = (props._shadow ?? "none") as string
    const opacity = (props._opacity ?? 100) as number
    const blur = (props._blur ?? 0) as number
    const borderRadius = (props._borderRadius ?? 0) as number

    const anim = props._animation ?? {}

    return {
      id: node.id,
      isSelected: node.events.selected,
      displayName: node.data.displayName || node.data.name,
      isDeletable: node.id !== ROOT_NODE,
      isHiddenOnBreakpoint: hideKey ? !!props[hideKey] : false,
      _spacingKey: `${mt},${mr},${mb},${ml},${pt},${pr},${pb},${pl}`,
      _designKey: `${shadow},${opacity},${blur},${borderRadius}`,
      _animKey: `${anim.entrance ?? "none"},${anim.hover ?? "none"},${anim.trigger ?? "scroll"},${anim.duration ?? 500},${anim.delay ?? 0}`,
      _overridesKey: JSON.stringify(bp),
      scrollEffect: (props._scrollEffect ?? "none") as ScrollEffect,
      stickyMode: (props._sticky ?? "none") as "none" | "top" | "bottom",
      widthMode: (bp._widthMode ?? props._widthMode ?? "fixed") as "fixed" | "fill" | "hug",
      nodeWidth: (bp._width ?? props._width ?? null) as number | null,
      nodeHeight: (bp._height ?? props._height ?? null) as number | null,
    }
  })

  // Reconstruct objects from stable keys — only recomputes when the key string changes
  const spacing = useMemo(() => {
    const [mt, mr, mb, ml, pt, pr, pb, pl] = _spacingKey.split(",").map(Number)
    return { marginTop: mt, marginRight: mr, marginBottom: mb, marginLeft: ml, paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl }
  }, [_spacingKey])

  const designEffects = useMemo(() => {
    const [shadow, opStr, blurStr, brStr] = _designKey.split(",")
    return { shadow, opacity: Number(opStr), blur: Number(blurStr), borderRadius: Number(brStr) }
  }, [_designKey])

  const animation = useMemo<AnimationConfig>(() => {
    const [entrance, hover, trigger, dur, del] = _animKey.split(",")
    return { entrance, hover, trigger, duration: Number(dur), delay: Number(del) } as AnimationConfig
  }, [_animKey])

  const responsiveOverrides = useMemo(() => JSON.parse(_overridesKey), [_overridesKey])

  const { actions } = useEditor()

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeletable) actions.delete(id)
  }, [actions, id, isDeletable])

  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleResize = useCallback((dw: number, dh: number, _edge: string) => {
    const el = wrapperRef.current
    if (!el) return
    // Find effective scale from ancestor transform
    let zoom = 1
    let parent = el.parentElement
    while (parent) {
      const t = getComputedStyle(parent).transform
      if (t && t !== "none") {
        const match = t.match(/matrix\(([^,]+)/)
        if (match) { zoom = parseFloat(match[1]); break }
      }
      parent = parent.parentElement
    }
    const rect = el.getBoundingClientRect()
    const propKey = breakpoint !== "desktop" ? "_responsive" : null

    if (dw !== 0) {
      const newW = Math.max(40, Math.round(rect.width / zoom + dw / zoom))
      if (propKey) {
        actions.setProp(id, (p: any) => {
          if (!p._responsive) p._responsive = {}
          if (!p._responsive[breakpoint]) p._responsive[breakpoint] = {}
          p._responsive[breakpoint]._width = newW
        })
      } else {
        actions.setProp(id, (p: any) => { p._width = newW })
      }
    }
    if (dh !== 0) {
      const newH = Math.max(20, Math.round(rect.height / zoom + dh / zoom))
      if (propKey) {
        actions.setProp(id, (p: any) => {
          if (!p._responsive) p._responsive = {}
          if (!p._responsive[breakpoint]) p._responsive[breakpoint] = {}
          p._responsive[breakpoint]._height = newH
        })
      } else {
        actions.setProp(id, (p: any) => { p._height = newH })
      }
    }
  }, [actions, id, breakpoint])

  const handleResizeEnd = useCallback(() => {}, [])

  const hasSpacing = Object.values(spacing).some((v) => v > 0)

  const nodeStyle = useMemo<React.CSSProperties>(() => ({
    ...(isHiddenOnBreakpoint ? { opacity: 0.3, pointerEvents: 'auto' as const } : {}),
    ...(!isSelected ? { '--hover-outline': 'rgba(0,91,211,0.3)' } as React.CSSProperties : {}),
    ...(isSelected ? { outlineColor: '#005bd3', boxShadow: '0 0 0 1px rgba(0,91,211,0.1)' } : {}),
    ...(widthMode === "fill" ? { width: "100%" } : widthMode === "hug" ? { width: "fit-content" } : nodeWidth ? { width: nodeWidth } : {}),
    ...(nodeHeight ? { height: nodeHeight } : {}),
    ...(hasSpacing ? {
      marginTop: spacing.marginTop || undefined, marginRight: spacing.marginRight || undefined,
      marginBottom: spacing.marginBottom || undefined, marginLeft: spacing.marginLeft || undefined,
      paddingTop: spacing.paddingTop || undefined, paddingRight: spacing.paddingRight || undefined,
      paddingBottom: spacing.paddingBottom || undefined, paddingLeft: spacing.paddingLeft || undefined,
    } : {}),
    ...(designEffects.shadow !== "none" ? { boxShadow: ({ sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 30px rgba(0,0,0,0.12)", xl: "0 20px 50px rgba(0,0,0,0.15)" } as Record<string, string>)[designEffects.shadow] } : {}),
    ...(designEffects.opacity < 100 && !isHiddenOnBreakpoint ? { opacity: designEffects.opacity / 100 } : {}),
    ...(designEffects.blur > 0 ? { backdropFilter: `blur(${designEffects.blur}px)` } : {}),
    ...(designEffects.borderRadius > 0 ? { borderRadius: designEffects.borderRadius, overflow: "hidden" as const } : {}),
    ...(stickyMode === "top" ? { position: "sticky" as const, top: 0, zIndex: 40 } : {}),
    ...(stickyMode === "bottom" ? { position: "sticky" as const, bottom: 0, zIndex: 40 } : {}),
  }), [isSelected, isHiddenOnBreakpoint, widthMode, nodeWidth, nodeHeight, hasSpacing, spacing, designEffects, stickyMode])
  const hasAnimation = animation.entrance !== "none" || animation.hover !== "none"
  const hasScrollEffect = scrollEffect !== "none"

  const mergedRender = breakpoint !== "desktop" && Object.keys(responsiveOverrides).length > 0
    ? cloneElement(render, { ...responsiveOverrides })
    : render

  const content = hasAnimation
    ? <AnimationWrapper animation={animation}>{mergedRender}</AnimationWrapper>
    : mergedRender

  const wrapped = hasScrollEffect
    ? <ScrollEffectWrapper effect={scrollEffect}>{content}</ScrollEffectWrapper>
    : content

  return (
    <div
      ref={wrapperRef}
      data-craft-node-id={id}
      className={cn(
        "relative group/node",
        !isSelected && "hover:outline hover:outline-1 hover:outline-dashed",
        isSelected && "outline outline-2 ring-1"
      )}
      style={nodeStyle}
    >
      {isSelected && isDeletable && (
        <ResizeHandles onResize={handleResize} onResizeEnd={handleResizeEnd} nodeId={id} />
      )}
      {/* Badge — visible on hover (CSS) or selection (state) */}
      <div className={cn("pointer-events-none absolute inset-x-0 z-20 flex items-center justify-between px-0.5", isSelected ? "opacity-100" : "opacity-0 group-hover/node:opacity-100")} style={{ top: -20, height: 18 }}>
          <div
            className="pointer-events-auto flex items-center gap-1 rounded-t px-1.5 py-px text-[10px] font-medium leading-tight"
            style={{
              background: isSelected ? '#005bd3' : 'var(--editor-chrome-bg, #e4e4e4)',
              color: isSelected ? 'white' : 'var(--editor-text-secondary, #616161)',
              borderTop: isSelected ? 'none' : '1px solid var(--editor-chrome-border, #c8c8c8)',
              borderLeft: isSelected ? 'none' : '1px solid var(--editor-chrome-border, #c8c8c8)',
              borderRight: isSelected ? 'none' : '1px solid var(--editor-chrome-border, #c8c8c8)',
            }}
          >
            {displayName}
            {isHiddenOnBreakpoint && (
              <span style={{ marginLeft: 4, padding: '0 4px', borderRadius: 3, fontSize: 9, background: 'rgba(255,255,255,0.2)' }}>Hidden</span>
            )}
          </div>
          {isSelected && isDeletable && (
            <Button variant="outline" size="icon" className="pointer-events-auto h-5 w-5 shadow-sm text-destructive hover:text-destructive"
              onClick={handleDelete} title="Delete block">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
      </div>

      {isSelected && (nodeWidth || nodeHeight) && (
        <div className="pointer-events-none absolute -bottom-5 left-1/2 z-20 -translate-x-1/2 rounded px-1.5 py-0.5 text-[10px] font-medium shadow-sm whitespace-nowrap" style={{ background: '#005bd3', color: 'white' }}>
          {nodeWidth ?? "auto"} × {nodeHeight ?? "auto"}
        </div>
      )}

      {isSelected && hasSpacing && (
        <>
          {spacing.marginTop > 0 && (
            <div className="pointer-events-none absolute left-0 right-0 bg-orange-400/10 border-b border-dashed border-orange-300/40" style={{ height: spacing.marginTop, top: -spacing.marginTop }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-400/60">{spacing.marginTop}</span>
            </div>
          )}
          {spacing.marginBottom > 0 && (
            <div className="pointer-events-none absolute left-0 right-0 bg-orange-400/10 border-t border-dashed border-orange-300/40" style={{ height: spacing.marginBottom, bottom: -spacing.marginBottom }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-400/60">{spacing.marginBottom}</span>
            </div>
          )}
          {spacing.marginLeft > 0 && (
            <div className="pointer-events-none absolute top-0 bottom-0 bg-orange-400/10 border-r border-dashed border-orange-300/40" style={{ width: spacing.marginLeft, left: -spacing.marginLeft }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-400/60">{spacing.marginLeft}</span>
            </div>
          )}
          {spacing.marginRight > 0 && (
            <div className="pointer-events-none absolute top-0 bottom-0 bg-orange-400/10 border-l border-dashed border-orange-300/40" style={{ width: spacing.marginRight, right: -spacing.marginRight }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-orange-400/60">{spacing.marginRight}</span>
            </div>
          )}
          {spacing.paddingTop > 0 && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 bg-green-400/10 border-b border-dashed border-green-300/40" style={{ height: spacing.paddingTop }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400/60">{spacing.paddingTop}</span>
            </div>
          )}
          {spacing.paddingBottom > 0 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-green-400/10 border-t border-dashed border-green-300/40" style={{ height: spacing.paddingBottom }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400/60">{spacing.paddingBottom}</span>
            </div>
          )}
          {spacing.paddingLeft > 0 && (
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 bg-green-400/10 border-r border-dashed border-green-300/40" style={{ width: spacing.paddingLeft }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400/60">{spacing.paddingLeft}</span>
            </div>
          )}
          {spacing.paddingRight > 0 && (
            <div className="pointer-events-none absolute top-0 bottom-0 right-0 bg-green-400/10 border-l border-dashed border-green-300/40" style={{ width: spacing.paddingRight }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-green-400/60">{spacing.paddingRight}</span>
            </div>
          )}
        </>
      )}

      {wrapped}
    </div>
  )
}
