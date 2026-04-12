import type { CSSProperties } from "react"

export const SHADOW_MAP: Record<string, string> = { sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)", lg: "0 10px 15px rgba(0,0,0,0.1)", xl: "0 20px 25px rgba(0,0,0,0.1)" }

export function getStyleProp(props: Record<string, unknown>, key: string, viewport: string): unknown {
  if (viewport !== "desktop") {
    const ov = props[`_${viewport}_${key}`]
    if (ov !== undefined && ov !== "") return ov
  }
  return props[`_${key}`]
}

export function buildHoverCSS(id: string, props: Record<string, unknown>, viewport: string): string | null {
  const g = (key: string) => getStyleProp(props, key, viewport)
  const bg = g("hoverBg") as string
  const scale = g("hoverScale") as number
  const shadow = g("hoverShadow") as string
  const opacity = g("hoverOpacity") as number
  const transition = (g("hoverTransition") as number) ?? 300
  const hasHover = bg || (scale && scale !== 1) || (shadow && shadow !== "none") || (opacity != null && opacity !== 100)
  if (!hasHover) return null
  const rules: string[] = []
  if (bg) rules.push(`background-color: ${bg} !important`)
  if (scale && scale !== 1) rules.push(`transform: scale(${scale})`)
  if (shadow && shadow !== "none") rules.push(`box-shadow: ${SHADOW_MAP[shadow] ?? "none"}`)
  if (opacity != null && opacity !== 100) rules.push(`opacity: ${opacity / 100}`)
  return `.hover-sec-${id}{transition:all ${transition}ms ease}.hover-sec-${id}:hover{${rules.join(";")}}`
}

export function buildSectionStyle(props: Record<string, unknown>, viewport: string): CSSProperties {
  const g = (key: string) => getStyleProp(props, key, viewport)
  const bgImage = g("backgroundImage") as string
  const bgOverlay = (g("backgroundOverlay") as number) ?? 0
  const shadow = g("shadow") as string
  const shadowX = g("shadowX") as number
  const shadowColor = (g("shadowColor") as string) || "rgba(0,0,0,0.1)"
  const shadowType = (g("shadowType") as string) || "drop"
  const inset = shadowType === "inner" ? "inset " : ""
  const customShadow = shadowX != null && shadowX !== 0
    ? `${inset}${shadowX}px ${(g("shadowY") as number) ?? 4}px ${(g("shadowBlur") as number) ?? 10}px ${(g("shadowSpread") as number) ?? 0}px ${shadowColor}`
    : undefined
  const gradient = g("gradient") as string
  const gradientFrom = (g("gradientFrom") as string) || "#3b82f6"
  const gradientTo = (g("gradientTo") as string) || "#8b5cf6"
  const gradientAngle = (g("gradientAngle") as number) ?? 135

  let backgroundImage: string | undefined
  if (gradient === "linear") {
    backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`
  } else if (gradient === "radial") {
    backgroundImage = `radial-gradient(circle, ${gradientFrom}, ${gradientTo})`
  } else if (bgImage) {
    backgroundImage = `${bgOverlay ? `linear-gradient(rgba(0,0,0,${bgOverlay / 100}),rgba(0,0,0,${bgOverlay / 100})),` : ""}url(${bgImage})`
  }

  const rotate = (g("rotate") as number) ?? 0
  const scale = (g("scale") as number) ?? 1
  const translateX = (g("translateX") as number) ?? 0
  const translateY = (g("translateY") as number) ?? 0
  const scaleX = (g("scaleX") as number) ?? 1
  const scaleY = (g("scaleY") as number) ?? 1
  const hasTransform = rotate !== 0 || scale !== 1 || translateX !== 0 || translateY !== 0 || scaleX !== 1 || scaleY !== 1

  const backdropBlur = g("backdropBlur") as number
  const backdropSaturate = (g("backdropSaturate") as number) ?? 100
  const hasBackdrop = backdropBlur || backdropSaturate !== 100

  const overflowVal = (g("overflow") as string) || "visible"

  return {
    // Size
    width: (g("width") as number) || undefined,
    height: (g("height") as number) || undefined,
    minHeight: (g("minHeight") as number) || undefined,
    aspectRatio: ((g("aspectRatio") as string) && (g("aspectRatio") as string) !== "auto") ? (g("aspectRatio") as string) : undefined,
    overflow: overflowVal as CSSProperties["overflow"],
    // Auto Layout (flex)
    display: (g("autoLayout") as string) === "enabled" ? "flex" : undefined,
    flexDirection: (g("autoLayout") as string) === "enabled" ? ((g("flexDirection") as CSSProperties["flexDirection"]) || "column") : undefined,
    gap: (g("autoLayout") as string) === "enabled" ? ((g("gap") as number) ?? undefined) : undefined,
    alignItems: (g("autoLayout") as string) === "enabled" ? ((g("alignItems") as string) || undefined) : undefined,
    justifyContent: (g("autoLayout") as string) === "enabled" ? ((g("justifyContent") as string) || undefined) : undefined,
    flexWrap: (g("autoLayout") as string) === "enabled" ? ((g("flexWrap") as CSSProperties["flexWrap"]) || undefined) : undefined,
    // Spacing
    paddingTop: (g("paddingTop") as number) || undefined, paddingBottom: (g("paddingBottom") as number) || undefined,
    paddingLeft: (g("paddingLeft") as number) || undefined, paddingRight: (g("paddingRight") as number) || undefined,
    marginTop: (g("marginTop") as number) || undefined, marginBottom: (g("marginBottom") as number) || undefined,
    marginLeft: (g("marginLeft") as number) || undefined, marginRight: (g("marginRight") as number) || undefined,
    maxWidth: (g("maxWidth") as number) || undefined, marginInline: (g("maxWidth") as number) ? "auto" : undefined,
    backgroundColor: gradient && gradient !== "none" ? undefined : (g("backgroundColor") as string) || undefined,
    backgroundImage,
    backgroundSize: bgImage && !gradient ? ((g("backgroundSize") as string) || "cover") : undefined, backgroundPosition: bgImage && !gradient ? ((g("backgroundPosition") as string) || "center") : undefined,
    color: (g("textColor") as string) || undefined, fontSize: (g("fontSize") as number) || undefined,
    textAlign: (g("textAlign") as CSSProperties["textAlign"]) || undefined,
    borderRadius: (() => {
      const r = (g("borderRadius") as number) || 0
      const tl = g("borderRadiusTL") as number | undefined
      const tr = g("borderRadiusTR") as number | undefined
      const bl = g("borderRadiusBL") as number | undefined
      const br = g("borderRadiusBR") as number | undefined
      if (tl != null || tr != null || bl != null || br != null) return `${tl ?? r}px ${tr ?? r}px ${br ?? r}px ${bl ?? r}px`
      return r || undefined
    })(),
    ...(() => {
      const bw = (g("borderWidth") as number) || 0
      const bc = (g("borderColor") as string) || undefined
      const bs = (g("borderStyle") as string) || "solid"
      const bp = (g("borderPosition") as string) || "inside"
      const bwt = g("borderWidthTop") as number | undefined
      const bwr = g("borderWidthRight") as number | undefined
      const bwb = g("borderWidthBottom") as number | undefined
      const bwl = g("borderWidthLeft") as number | undefined
      const hasIndividual = bwt != null || bwr != null || bwb != null || bwl != null
      const bwVal = hasIndividual ? `${bwt ?? bw}px ${bwr ?? bw}px ${bwb ?? bw}px ${bwl ?? bw}px` : (bw || undefined)
      if (bp === "outside" && (bw || hasIndividual)) {
        return { outline: `${bw || 1}px ${bs} ${bc || "transparent"}`, outlineOffset: "0px" }
      }
      return { borderWidth: bwVal, borderColor: bc, borderStyle: (bw || hasIndividual) ? bs : undefined }
    })(), opacity: (g("opacity") as number) != null ? (g("opacity") as number) / 100 : undefined,
    mixBlendMode: ((g("blendMode") as string) && (g("blendMode") as string) !== "normal") ? (g("blendMode") as CSSProperties["mixBlendMode"]) : undefined,
    boxShadow: (g("shadowEnabled") as number) === 0 ? undefined : (customShadow || (shadow && shadow !== "none" ? SHADOW_MAP[shadow] : undefined)),
    filter: (g("blur") as number) ? `blur(${g("blur")}px)` : undefined,
    backdropFilter: hasBackdrop ? `blur(${backdropBlur ?? 0}px) saturate(${backdropSaturate}%)` : undefined,
    WebkitBackdropFilter: hasBackdrop ? `blur(${backdropBlur ?? 0}px) saturate(${backdropSaturate}%)` : undefined,
    transform: hasTransform ? [rotate !== 0 && `rotate(${rotate}deg)`, scale !== 1 && `scale(${scale})`, (translateX !== 0 || translateY !== 0) && `translate(${translateX}px, ${translateY}px)`, scaleX !== 1 && `scaleX(${scaleX})`, scaleY !== 1 && `scaleY(${scaleY})`].filter(Boolean).join(' ') || undefined : undefined,
    cursor: ((g("cursor") as string) && (g("cursor") as string) !== "auto") ? (g("cursor") as CSSProperties["cursor"]) : undefined,
    // Docking
    ...(() => {
      const dockH = (g("dockH") as string) || "none"
      const dockV = (g("dockV") as string) || "none"
      return {
        ...(dockH === "left" && { marginRight: "auto" }),
        ...(dockH === "center" && { marginLeft: "auto", marginRight: "auto" }),
        ...(dockH === "right" && { marginLeft: "auto" }),
        ...(dockH === "stretch" && { width: "100%" }),
        ...(dockV === "top" && { alignSelf: "flex-start" as const }),
        ...(dockV === "center" && { alignSelf: "center" as const }),
        ...(dockV === "bottom" && { alignSelf: "flex-end" as const }),
        ...(dockV === "stretch" && { alignSelf: "stretch" as const }),
      }
    })(),
    // CSS Grid (opt-in: only when _gridCols > 1 or _gridRows > 1)
    ...(() => {
      const gridCols = (g("gridCols") as number) || 1
      const gridRows = (g("gridRows") as number) || 1
      const isGrid = gridCols > 1 || gridRows > 1
      if (!isGrid) return {}
      const gridGap = (g("gridGap") as number) ?? 16
      const gridColSizes = (g("gridColSizes") as string) || `repeat(${gridCols}, 1fr)`
      const gridRowSizes = (g("gridRowSizes") as string) || `repeat(${gridRows}, auto)`
      return {
        display: "grid" as const,
        gridTemplateColumns: gridColSizes,
        gridTemplateRows: gridRows > 1 ? gridRowSizes : undefined,
        gap: `${gridGap}px`,
      }
    })(),
    // Grid cell placement (for children inside a grid parent)
    gridColumn: (g("gridColumn") as string) || undefined,
    gridRow: (g("gridRow") as string) || undefined,
    backgroundAttachment: (g("parallax") as string) === "on" ? "fixed" : undefined,
    position: (g("position") as CSSProperties["position"]) || undefined,
    top: ((g("position") as string) === "sticky" || (g("position") as string) === "fixed") ? ((g("positionTop") as number) ?? 0) : undefined,
    zIndex: ((g("position") as string) === "sticky" || (g("position") as string) === "fixed") ? ((g("zIndex") as number) ?? 10) : undefined,
  }
}

export function mergePropsForViewport(props: Record<string, unknown>, viewport: string): Record<string, unknown> {
  if (viewport === "desktop") return props
  const overrides = props[`_props_${viewport}`]
  if (overrides && typeof overrides === "object") return { ...props, ...(overrides as Record<string, unknown>) }
  return props
}
