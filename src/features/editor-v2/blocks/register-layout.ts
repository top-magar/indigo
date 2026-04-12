import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { LayoutGrid, Minus, Layers, Rows3, PanelTopDashed, PanelBottomDashed } from "lucide-react"


registerBlock("columns", {
  component: dynamic(() => import("./columns").then(m => ({ default: m.Columns })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "columns", label: "Columns", type: "number" },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { columns: 2, gap: 16 },
  icon: LayoutGrid,
  category: "layout",
})

registerBlock("spacer", {
  component: dynamic(() => import("./spacer").then(m => ({ default: m.Spacer })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "layout",
  icon: Minus,
  fields: [
    { name: "height", label: "Height (px)", type: "number" },
    { name: "mobileHeight", label: "Mobile Height (px)", type: "number" },
  ],
  defaultProps: { height: 64, mobileHeight: 32 },
})

registerBlock("container", {
  component: dynamic(() => import("./container").then(m => ({ default: m.Container })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [{ value: "flex-row", label: "Row" }, { value: "flex-col", label: "Column" }, { value: "grid", label: "Grid" }] },
    { name: "gap", label: "Gap", type: "number" },
    { name: "alignItems", label: "Align Items", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "stretch", label: "Stretch" }] },
    { name: "justifyContent", label: "Justify Content", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }, { value: "between", label: "Space Between" }, { value: "around", label: "Space Around" }] },
    { name: "wrap", label: "Wrap", type: "toggle" },
  ],
  defaultProps: { layout: "flex-col", gap: 16, alignItems: "stretch", justifyContent: "start", wrap: false },
  icon: LayoutGrid,
  category: "layout",
})

registerBlock("stack", {
  component: dynamic(() => import("./stack").then(m => ({ default: m.Stack })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "direction", label: "Direction", type: "select", options: [{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }] },
    { name: "gap", label: "Gap", type: "number" },
    { name: "align", label: "Align", type: "select", options: [{ value: "start", label: "Start" }, { value: "center", label: "Center" }, { value: "end", label: "End" }] },
  ],
  defaultProps: { direction: "vertical", gap: 12, align: "start" },
  icon: Layers,
  category: "layout",
})

registerBlock("heroContainer", {
  component: dynamic(() => import("./hero-container").then(m => ({ default: m.HeroContainer })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "variant", label: "Variant", type: "select", options: [{ value: "full", label: "Full" }, { value: "split", label: "Split" }] },
    { name: "backgroundImage", label: "Background Image", type: "image" },
    { name: "overlay", label: "Overlay", type: "toggle" },
  ],
  defaultProps: { variant: "full", backgroundImage: "", overlay: false },
  icon: Rows3,
  category: "layout",
})

registerBlock("headerContainer", {
  component: dynamic(() => import("./header-container").then(m => ({ default: m.HeaderContainer })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [
      { value: "left-right", label: "Left + Right" },
      { value: "left-center-right", label: "Left + Center + Right" },
      { value: "center-only", label: "Center Only" },
    ]},
    { name: "sticky", label: "Sticky", type: "toggle" },
    { name: "transparent", label: "Transparent", type: "toggle", description: "Transparent on top, solid on scroll" },
    { name: "borderBottom", label: "Border Bottom", type: "toggle" },
    { name: "backgroundColor", label: "Background", type: "color" },
  ],
  defaultProps: { layout: "left-right", sticky: true, transparent: false, borderBottom: true, backgroundColor: "#ffffff" },
  icon: PanelTopDashed,
  category: "layout",
})

registerBlock("footerContainer", {
  component: dynamic(() => import("./footer-container").then(m => ({ default: m.FooterContainer })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "layout", label: "Layout", type: "select", options: [
      { value: "columns", label: "Columns" },
      { value: "stacked", label: "Stacked / Centered" },
      { value: "minimal", label: "Minimal" },
    ]},
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
  ],
  defaultProps: { layout: "columns", backgroundColor: "#111827", textColor: "#f9fafb" },
  icon: PanelBottomDashed,
  category: "layout",
})
