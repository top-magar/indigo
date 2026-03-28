"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface VideoProps {
  url: string
  aspectRatio: "16/9" | "4/3" | "1/1"
  maxWidth: number
  borderRadius: number
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v")
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {}
  return null
}

export const VideoBlock = ({ url, aspectRatio, maxWidth, borderRadius }: VideoProps) => {
  const { connectors: { connect, drag } } = useNode()
  const embedUrl = getEmbedUrl(url)

  return (
    <div ref={craftRef(connect, drag)} style={{ maxWidth, margin: "0 auto" }}>
      {embedUrl ? (
        <div style={{ position: "relative", aspectRatio, borderRadius, overflow: "hidden" }}>
          <iframe
            src={embedUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div style={{ aspectRatio, borderRadius, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14, border: "2px dashed #d1d5db" }}>
          {url ? "Invalid video URL" : "Paste a YouTube or Vimeo URL →"}
        </div>
      )}
    </div>
  )
}

const VideoSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as VideoProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Video URL
        <input type="url" value={props.url} onChange={(e) => setProp((p: VideoProps) => (p.url = e.target.value))} placeholder="https://youtube.com/watch?v=..." className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <p className="text-[10px] text-muted-foreground">Supports YouTube and Vimeo</p>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Aspect Ratio
        <select value={props.aspectRatio} onChange={(e) => setProp((p: VideoProps) => (p.aspectRatio = e.target.value as any))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm">
          <option value="16/9">16:9</option><option value="4/3">4:3</option><option value="1/1">1:1</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Max Width ({props.maxWidth}px)
        <input type="range" min={300} max={1200} value={props.maxWidth} onChange={(e) => setProp((p: VideoProps) => (p.maxWidth = +e.target.value))} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Border Radius ({props.borderRadius}px)
        <input type="range" min={0} max={24} value={props.borderRadius} onChange={(e) => setProp((p: VideoProps) => (p.borderRadius = +e.target.value))} />
      </label>
    </div>
  )
}

VideoBlock.craft = {
  displayName: "Video",
  props: { url: "", aspectRatio: "16/9", maxWidth: 800, borderRadius: 8 } satisfies VideoProps,
  related: { settings: VideoSettings },
}
