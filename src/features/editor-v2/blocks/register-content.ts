import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { Type, ImageIcon, Minus, FileText, Heading, Pilcrow, Play, Code, MapPin } from "lucide-react"


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
  category: "content",
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
  category: "content",
})

registerBlock("headingBlock", {
  component: dynamic(() => import("./heading").then(m => ({ default: m.HeadingBlock })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "level", label: "Level", type: "select", options: [{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }] },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Heading", level: "h2", alignment: "left" },
  icon: Heading,
  category: "content",
})

registerBlock("paragraphBlock", {
  component: dynamic(() => import("./paragraph").then(m => ({ default: m.ParagraphBlock })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "text", label: "Text", type: "textarea" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Paragraph text", alignment: "left" },
  icon: Pilcrow,
  category: "content",
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
  category: "content",
})

registerBlock("video", {
  component: dynamic(() => import("./video").then(m => ({ default: m.Video })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "content",
  icon: Play,
  fields: [
    { name: "url", label: "Video URL", type: "text" },
    { name: "aspectRatio", label: "Aspect Ratio", type: "select", options: [{ value: "16:9", label: "16:9" }, { value: "4:3", label: "4:3" }, { value: "1:1", label: "1:1" }] },
    { name: "autoplay", label: "Autoplay", type: "toggle" },
    { name: "muted", label: "Muted", type: "toggle" },
  ],
  defaultProps: { url: "", aspectRatio: "16:9", autoplay: false, muted: false },
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
  category: "content",
})

registerBlock("map", {
  component: dynamic(() => import("./map").then(m => ({ default: m.Map })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "content",
  icon: MapPin,
  fields: [
    { name: "address", label: "Address", type: "text" },
    { name: "zoom", label: "Zoom", type: "number" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { address: "", zoom: 14, height: 300 },
})

registerBlock("customCode", {
  component: dynamic(() => import("./custom-code").then(m => ({ default: m.CustomCode })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "content",
  icon: Code,
  fields: [
    { name: "html", label: "HTML", type: "textarea" },
    { name: "css", label: "CSS", type: "textarea" },
  ],
  defaultProps: { html: "", css: "" },
})
