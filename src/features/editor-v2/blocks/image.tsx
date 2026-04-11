interface ImageProps {
  src: string; alt: string; objectFit: "cover" | "contain" | "fill"
  borderRadius: number; maxHeight: number; caption: string
}

export function Image({ src, alt, objectFit, borderRadius, maxHeight, caption }: ImageProps) {
  return (
    <figure className="m-0">
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", maxHeight: maxHeight || undefined, objectFit, borderRadius }} />
      ) : (
        <div className="flex h-48 items-center justify-center rounded bg-gray-100 text-sm text-gray-400">Add image</div>
      )}
      {caption && <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--store-color-muted)" }}>{caption}</figcaption>}
    </figure>
  )
}
