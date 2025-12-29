"use client"

import { cn } from "@/lib/utils"
import type { ImageBlock as ImageBlockType } from "@/types/blocks"
import Image from "next/image"

interface ImageBlockProps {
  block: ImageBlockType
}

const BORDER_RADIUS_MAP = {
  none: "",
  small: "rounded",
  medium: "rounded-lg",
  large: "rounded-xl",
  full: "rounded-full",
}

const ASPECT_RATIO_MAP = {
  auto: "",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
}

const OBJECT_FIT_MAP = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
}

export function ImageBlock({ block }: ImageBlockProps) {
  const { settings, variant } = block
  const {
    src,
    alt = "",
    width,
    height,
    aspectRatio,
    objectFit = "cover",
    link,
    caption,
  } = settings

  // Determine border radius based on variant or settings
  const borderRadius = variant === "circle" ? "full" 
    : variant === "rounded" ? "medium"
    : variant === "card" ? "large"
    : "none"

  // Use custom dimensions if provided
  const hasCustomDimensions = width || height
  const containerStyle = hasCustomDimensions ? {
    width: width ? `${width}px` : undefined,
    maxWidth: '100%',
  } : undefined

  const imageElement = (
    <figure 
      className={cn(
        "relative",
        !hasCustomDimensions && "w-full",
        variant === "card" && "shadow-lg"
      )}
      style={containerStyle}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          BORDER_RADIUS_MAP[borderRadius],
          aspectRatio && aspectRatio !== "auto" ? ASPECT_RATIO_MAP[aspectRatio] || "" : "",
        )}
        style={height && !aspectRatio ? { height: `${height}px` } : undefined}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className={cn(
              "w-full h-full",
              OBJECT_FIT_MAP[objectFit],
              !aspectRatio && !height && "h-auto",
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn(
              "w-full bg-muted flex items-center justify-center text-muted-foreground",
              aspectRatio && aspectRatio !== "auto" ? "h-full" : "aspect-video",
            )}
            style={height ? { height: `${height}px` } : undefined}
          >
            <svg
              className="h-12 w-12 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )

  if (link) {
    return (
      <a
        href={link}
        className="block transition-opacity hover:opacity-90"
        target={link.startsWith("http") ? "_blank" : undefined}
        rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {imageElement}
      </a>
    )
  }

  return imageElement
}
