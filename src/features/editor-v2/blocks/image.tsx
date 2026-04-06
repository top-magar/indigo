interface ImageProps {
  src: string
  alt: string
  aspectRatio: "auto" | "1/1" | "16/9" | "4/3" | "3/2"
  objectFit: "cover" | "contain" | "fill"
  borderRadius: number
  maxWidth: number
  alignment: "left" | "center" | "right"
  paddingTop: number
  paddingBottom: number
}

const marginMap = { left: "0", center: "0 auto", right: "0 0 0 auto" } as const

export function ImageRender({ src, alt, aspectRatio, objectFit, borderRadius, maxWidth, alignment, paddingTop, paddingBottom }: ImageProps) {
  return (
    <div style={{ padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div style={{ maxWidth: maxWidth || undefined, margin: marginMap[alignment] }}>
        {src ? (
          <img src={src} alt={alt} style={{ width: "100%", display: "block", aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio, objectFit, borderRadius }} />
        ) : (
          <div style={{ aspectRatio: aspectRatio === "auto" ? "16/9" : aspectRatio, backgroundColor: "var(--v2-bg, #f3f4f6)", borderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
            {alt || "Image"}
          </div>
        )}
      </div>
    </div>
  )
}
