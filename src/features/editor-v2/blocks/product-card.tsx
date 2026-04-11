import NextImage from "next/image"

interface ProductCardProps {
  image: string; name: string; price: string; compareAtPrice: string
  buttonText: string; badge: string
}

const safeUrl = (url: string) => url && (url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/")) ? url : ""

export function ProductCard({ image, name, price, compareAtPrice, buttonText, badge }: ProductCardProps) {
  const src = safeUrl(image)
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {src ? <NextImage src={src} alt={name || "Product"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" loading="lazy" unoptimized className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-gray-400" aria-hidden="true">No image</div>}
        {badge && badge !== "none" && <span className="absolute left-2 top-2 rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{price}</span>
          {compareAtPrice && <span className="text-sm text-gray-400 line-through" aria-label={`Was ${compareAtPrice}`}>{compareAtPrice}</span>}
        </div>
        {buttonText && <button type="button" className="mt-3 w-full py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>}
      </div>
    </div>
  )
}
