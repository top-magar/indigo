interface MapProps {
  address: string; zoom: number; height: number
}

export function Map({ address, zoom = 14, height = 300 }: MapProps) {
  if (!address) {
    return (
      <div className="flex items-center justify-center rounded border border-dashed p-12 text-sm text-gray-400">
        Enter an address to show the map
      </div>
    )
  }

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`

  return (
    <iframe
      src={src}
      width="100%"
      height={height}
      style={{ border: 0, borderRadius: 8 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
