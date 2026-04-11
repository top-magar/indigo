interface VideoProps {
  url: string; aspectRatio: string; autoplay: boolean; muted: boolean
}

function getEmbedUrl(url: string, autoplay: boolean, muted: boolean): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=${+autoplay}&mute=${+muted}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=${+autoplay}&muted=${+muted}`
  return null
}

const ratioMap: Record<string, string> = { "16:9": "56.25%", "4:3": "75%", "1:1": "100%" }

export function Video({ url, aspectRatio, autoplay, muted }: VideoProps) {
  const embed = getEmbedUrl(url || "", autoplay, muted)
  const padding = ratioMap[aspectRatio] || "56.25%"

  if (!embed) {
    return (
      <div className="flex items-center justify-center rounded border border-dashed p-12 text-sm text-gray-400">
        {url ? `Unsupported URL: ${url}` : "Paste a YouTube or Vimeo URL"}
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: padding }}>
      <iframe src={embed} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen" allowFullScreen />
    </div>
  )
}
