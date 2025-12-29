"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import type { GalleryBlock as GalleryBlockType } from "@/types/blocks"

interface GalleryBlockProps {
  block: GalleryBlockType
}

export function GalleryBlock({ block }: GalleryBlockProps) {
  const { variant, settings } = block

  switch (variant) {
    case "grid":
      return <GridGallery settings={settings} />
    case "masonry":
      return <MasonryGallery settings={settings} />
    case "carousel":
      return <CarouselGallery settings={settings} />
    case "lightbox":
      return <LightboxGallery settings={settings} />
    default:
      return <GridGallery settings={settings} />
  }
}

interface VariantProps {
  settings: GalleryBlockType["settings"]
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
}

const gapClasses = {
  none: "gap-0",
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
}

const aspectRatioClasses = {
  auto: "",
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "3:2": "aspect-[3/2]",
}

function GridGallery({ settings }: VariantProps) {
  const { images, columns, gap, aspectRatio, showCaptions, enableLightbox } = settings
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
        {images.map((image, index) => (
          <div key={index} className="group">
            <button
              onClick={() => enableLightbox && setLightboxIndex(index)}
              disabled={!enableLightbox}
              className={cn(
                "relative w-full overflow-hidden rounded-lg bg-muted",
                aspectRatioClasses[aspectRatio],
                enableLightbox && "cursor-pointer"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                className={cn(
                  "object-cover transition-transform duration-300",
                  enableLightbox && "group-hover:scale-105"
                )}
              />
            </button>
            {showCaptions && image.caption && (
              <p className="mt-2 text-center text-sm text-muted-foreground">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {enableLightbox && lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % images.length)}
        />
      )}
    </>
  )
}

function MasonryGallery({ settings }: VariantProps) {
  const { images, columns, gap, showCaptions, enableLightbox } = settings
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Distribute images into columns
  const columnArrays: typeof images[] = Array.from({ length: columns }, () => [])
  images.forEach((image, index) => {
    columnArrays[index % columns].push(image)
  })

  return (
    <>
      <div className={cn("flex", gapClasses[gap])}>
        {columnArrays.map((columnImages, colIndex) => (
          <div key={colIndex} className={cn("flex flex-1 flex-col", gapClasses[gap])}>
            {columnImages.map((image, imgIndex) => {
              const originalIndex = imgIndex * columns + colIndex
              return (
                <div key={imgIndex} className="group">
                  <button
                    onClick={() => enableLightbox && setLightboxIndex(originalIndex)}
                    disabled={!enableLightbox}
                    className={cn(
                      "relative w-full overflow-hidden rounded-lg bg-muted",
                      enableLightbox && "cursor-pointer"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || ""}
                      width={400}
                      height={300}
                      className={cn(
                        "h-auto w-full object-cover transition-transform duration-300",
                        enableLightbox && "group-hover:scale-105"
                      )}
                    />
                  </button>
                  {showCaptions && image.caption && (
                    <p className="mt-2 text-center text-sm text-muted-foreground">{image.caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {enableLightbox && lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % images.length)}
        />
      )}
    </>
  )
}

function CarouselGallery({ settings }: VariantProps) {
  const { images, aspectRatio, showCaptions } = settings
  const [currentIndex, setCurrentIndex] = useState(0)

  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrentIndex((i) => (i + 1) % images.length)

  if (images.length === 0) return null

  return (
    <div className="relative">
      <div className={cn("relative overflow-hidden rounded-lg bg-muted", aspectRatioClasses[aspectRatio] || "aspect-video")}>
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt || ""}
          fill
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </>
      )}

      {showCaptions && images[currentIndex].caption && (
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {images[currentIndex].caption}
        </p>
      )}
    </div>
  )
}

function LightboxGallery({ settings }: VariantProps) {
  const { images, columns, gap, aspectRatio, showCaptions } = settings
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
        {images.map((image, index) => (
          <div key={index} className="group">
            <button
              onClick={() => setLightboxIndex(index)}
              className={cn(
                "relative w-full cursor-pointer overflow-hidden rounded-lg bg-muted",
                aspectRatioClasses[aspectRatio]
              )}
            >
              <Image
                src={image.src}
                alt={image.alt || ""}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
            {showCaptions && image.caption && (
              <p className="mt-2 text-center text-sm text-muted-foreground">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % images.length)}
        />
      )}
    </>
  )
}

interface LightboxProps {
  images: GalleryBlockType["settings"]["images"]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const image = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={image.src}
          alt={image.alt || ""}
          width={1200}
          height={800}
          className="max-h-[85vh] w-auto object-contain"
        />
        {image.caption && (
          <p className="mt-4 text-center text-white">{image.caption}</p>
        )}
        <p className="mt-2 text-center text-sm text-white/60">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  )
}
