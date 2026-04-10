interface ProductCardProps {
  image: string; name: string; price: string; compareAtPrice: string
  buttonText: string; badge: string
}

export function ProductCard({ image, name, price, compareAtPrice, buttonText, badge }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {image ? <img src={image} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
        {badge && <span className="absolute left-2 top-2 rounded bg-black px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{price}</span>
          {compareAtPrice && <span className="text-sm text-gray-400 line-through">{compareAtPrice}</span>}
        </div>
        {buttonText && <button className="mt-3 w-full rounded py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)" }}>{buttonText}</button>}
      </div>
    </div>
  )
}
