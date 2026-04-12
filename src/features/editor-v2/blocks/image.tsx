import NextImage from "next/image"

interface ImageProps {
  src: string; alt: string; objectFit: "cover" | "contain" | "fill"
  borderRadius: number; maxHeight: number; caption: string
}

export function Image({ src, alt, objectFit, borderRadius, maxHeight, caption }: ImageProps) {
  return (
    <figure className="m-0">
      {src ? (
        <NextImage src={src} alt={alt || ""} width={800} height={400} sizes="100vw" loading="lazy" unoptimized style={{ width: "100%", height: "auto", maxHeight: maxHeight || undefined, objectFit, borderRadius }} />
      ) : (
        <div className="flex h-48 items-center justify-center rounded bg-gray-100 text-sm text-gray-400">Add image</div>
      )}
      {caption && <figcaption className="mt-2 text-center text-sm" style={{ color: "var(--store-color-muted, #64748b)" }}>{caption}</figcaption>}
    </figure>
  )
}
