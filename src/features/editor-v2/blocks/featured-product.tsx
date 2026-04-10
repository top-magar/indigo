interface FeaturedProductProps {
  image: string; name: string; price: string; description: string
  buttonText: string; badge: string
}

export function FeaturedProduct({ image, name, price, description, buttonText, badge }: FeaturedProductProps) {
  return (
    <div className="grid min-h-[400px] grid-cols-2 gap-8 py-8">
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">Product image</div>}
        {badge && <span className="absolute left-3 top-3 rounded bg-black px-2 py-1 text-xs font-semibold text-white">{badge}</span>}
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-bold">{name}</h2>
        <p className="mt-2 text-2xl font-semibold">{price}</p>
        {description && <p className="mt-4 text-gray-600">{description}</p>}
        {buttonText && <button className="mt-6 w-fit rounded px-8 py-3 font-medium text-white" style={{ backgroundColor: "var(--store-color-primary, #000)" }}>{buttonText}</button>}
      </div>
    </div>
  )
}
