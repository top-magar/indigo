import type { ComponentMeta } from "../types"

export const meta: ComponentMeta = {
  label: "Video",
  category: "media",
  icon: "play",
  tag: "video",
  contentModel: { category: "content", children: [] },
  propsSchema: [
    { name: "src", label: "Source URL", type: "string" },
    { name: "poster", label: "Poster Image", type: "string" },
    { name: "autoplay", label: "Autoplay", type: "boolean", defaultValue: false },
    { name: "loop", label: "Loop", type: "boolean", defaultValue: false },
    { name: "muted", label: "Muted", type: "boolean", defaultValue: false },
    { name: "controls", label: "Controls", type: "boolean", defaultValue: true },
  ],
}
