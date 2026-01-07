"use client"

import { useState, useRef } from "react"
import { cn } from "@/shared/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"
import type { VideoBlock as VideoBlockType } from "@/types/blocks"

interface VideoBlockProps {
  block: VideoBlockType
}

export function VideoBlock({ block }: VideoBlockProps) {
  const { variant, settings } = block

  switch (variant) {
    case "inline":
      return <InlineVideo settings={settings} />
    case "fullwidth":
      return <FullWidthVideo settings={settings} />
    case "lightbox":
      return <LightboxVideo settings={settings} />
    default:
      return <InlineVideo settings={settings} />
  }
}

interface VariantProps {
  settings: VideoBlockType["settings"]
}

// Parse video URL to get embed URL for YouTube/Vimeo
function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "direct"; embedUrl: string } {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }
  
  return { type: "direct", embedUrl: url }
}

const aspectRatioClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "21:9": "aspect-[21/9]",
}

const maxWidthClasses = {
  full: "w-full",
  large: "max-w-4xl",
  medium: "max-w-2xl",
  small: "max-w-md",
}

function InlineVideo({ settings }: VariantProps) {
  const { src, poster, autoplay, loop, muted, controls, aspectRatio, caption, maxWidth } = settings
  const { type, embedUrl } = getEmbedUrl(src)

  return (
    <div className={cn("mx-auto", maxWidthClasses[maxWidth || "full"])}>
      <div className={cn("relative overflow-hidden rounded-lg bg-muted", aspectRatioClasses[aspectRatio])}>
        {type === "direct" ? (
          <video
            src={embedUrl}
            poster={poster}
            autoPlay={autoplay}
            loop={loop}
            muted={muted || autoplay}
            controls={controls}
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
      {caption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">{caption}</p>
      )}
    </div>
  )
}

function FullWidthVideo({ settings }: VariantProps) {
  const { src, poster, autoplay, loop, muted, controls, aspectRatio, caption } = settings
  const { type, embedUrl } = getEmbedUrl(src)

  return (
    <div className="w-full">
      <div className={cn("relative overflow-hidden bg-muted", aspectRatioClasses[aspectRatio])}>
        {type === "direct" ? (
          <video
            src={embedUrl}
            poster={poster}
            autoPlay={autoplay}
            loop={loop}
            muted={muted || autoplay}
            controls={controls}
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${muted ? 1 : 0}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
      {caption && (
        <p className="mt-2 px-4 text-center text-sm text-muted-foreground">{caption}</p>
      )}
    </div>
  )
}

function LightboxVideo({ settings }: VariantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { src, poster, aspectRatio, caption, maxWidth } = settings
  const { type, embedUrl } = getEmbedUrl(src)

  return (
    <>
      <div className={cn("mx-auto", maxWidthClasses[maxWidth || "full"])}>
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "group relative w-full overflow-hidden rounded-lg bg-muted",
            aspectRatioClasses[aspectRatio]
          )}
        >
          {poster ? (
            <img src={poster} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <HugeiconsIcon icon={PlayIcon} className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
              <HugeiconsIcon icon={PlayIcon} className="h-8 w-8 text-black" />
            </div>
          </div>
        </button>
        {caption && (
          <p className="mt-2 text-center text-sm text-muted-foreground">{caption}</p>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video overflow-hidden rounded-lg">
              {type === "direct" ? (
                <video src={embedUrl} autoPlay controls className="h-full w-full" />
              ) : (
                <iframe
                  src={`${embedUrl}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
