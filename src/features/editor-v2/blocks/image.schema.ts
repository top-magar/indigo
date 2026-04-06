import { defineBlock } from "../core/schema"
import { ImageRender } from "./image"

const fields = {
  src: { type: "image", label: "Image", default: "", group: "Content", content: true },
  alt: { type: "text", label: "Alt Text", default: "Image", group: "Content", content: true },
  aspectRatio: { type: "enum", label: "Aspect Ratio", default: "auto" as const, group: "Layout", options: [{ value: "auto" as const, label: "Auto" }, { value: "1/1" as const, label: "Square" }, { value: "16/9" as const, label: "16:9" }, { value: "4/3" as const, label: "4:3" }, { value: "3/2" as const, label: "3:2" }] },
  objectFit: { type: "enum", label: "Fit", default: "cover" as const, group: "Layout", options: [{ value: "cover" as const, label: "Cover" }, { value: "contain" as const, label: "Contain" }, { value: "fill" as const, label: "Fill" }] },
  borderRadius: { type: "number", label: "Radius", default: 0, group: "Style", min: 0, max: 32, unit: "px" },
  maxWidth: { type: "number", label: "Max Width", default: 0, group: "Layout", min: 0, max: 1200, unit: "px" },
  alignment: { type: "enum", label: "Align", default: "center" as const, group: "Layout", options: [{ value: "left" as const, label: "Left" }, { value: "center" as const, label: "Center" }, { value: "right" as const, label: "Right" }] },
  paddingTop: { type: "spacing", label: "Padding Top", default: 24, group: "Layout", min: 0, max: 120 },
  paddingBottom: { type: "spacing", label: "Padding Bottom", default: 24, group: "Layout", min: 0, max: 120 },
} as const

export const ImageSchema = defineBlock({
  name: "Image",
  category: "Content",
  icon: "ImageIcon",
  description: "Single image block with aspect ratio and fit controls",
  fields,
  render: ImageRender,
})
