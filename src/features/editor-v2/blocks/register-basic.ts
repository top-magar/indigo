import dynamic from "next/dynamic"
import React from "react"
import { registerBlock } from "../registry"
import { Type, ImageIcon, MousePointerClick, Minus, FileText } from "lucide-react"
import { BlockSkeleton } from "./block-skeleton"


registerBlock("text", {
  component: dynamic(() => import("./text").then(m => ({ default: m.Text })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "textarea" },
    { name: "fontSize", label: "Font Size", type: "number" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { name: "tagName", label: "Tag", type: "select", options: [{ value: "p", label: "Paragraph" }, { value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }] },
  ],
  defaultProps: { text: "Edit this text", fontSize: 16, fontWeight: 400, color: "#000000", alignment: "left", tagName: "p" },
  icon: Type,
  category: "basic",
})

registerBlock("image", {
  component: dynamic(() => import("./image").then(m => ({ default: m.Image })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "src", label: "Image URL", type: "image" },
    { name: "alt", label: "Alt Text", type: "text" },
    { name: "objectFit", label: "Fit", type: "select", options: [{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }] },
    { name: "borderRadius", label: "Corner Radius", type: "number" },
  ],
  defaultProps: { src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400, caption: "" },
  icon: ImageIcon,
  category: "basic",
})

registerBlock("button", {
  component: dynamic(() => import("./button").then(m => ({ default: m.Button })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Label", type: "text" },
    { name: "href", label: "URL", type: "text" },
    { name: "variant", label: "Style", type: "select", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
    { name: "color", label: "Color", type: "color" },
  ],
  defaultProps: { text: "Click me", href: "#", variant: "solid", size: "md", color: "#000000" },
  icon: MousePointerClick,
  category: "basic",
})

registerBlock("divider", {
  component: dynamic(() => import("./divider").then(m => ({ default: m.Divider })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "height", label: "Height", type: "number" },
    { name: "showLine", label: "Show Line", type: "toggle" },
    { name: "lineColor", label: "Line Color", type: "color" },
  ],
  defaultProps: { height: 48, showLine: true, lineColor: "#e5e7eb", lineWidth: 1 },
  icon: Minus,
  category: "basic",
})

registerBlock("richText", {
  component: dynamic(() => import("./rich-text").then(m => ({ default: m.RichText })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "content", label: "HTML Content", type: "textarea" },
    { name: "maxWidth", label: "Max Width", type: "number" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { name: "fontSize", label: "Font Size", type: "number" },
  ],
  defaultProps: { content: "<h2>About Us</h2><p>Write your story here.</p>", maxWidth: 700, alignment: "left", fontSize: 16 },
  icon: FileText,
  category: "basic",
})
