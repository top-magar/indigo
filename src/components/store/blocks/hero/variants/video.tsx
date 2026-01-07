"use client"

import Link from "next/link"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { HeroBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../../editable-text"

interface VideoHeroProps {
  blockId: string
  settings: HeroBlock["settings"]
}

export function VideoHero({ blockId, settings }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, that's okay
      })
    }
  }, [])

  const heightClass = {
    full: "min-h-screen",
    large: "min-h-[80vh]",
    medium: "min-h-[60vh]",
  }[settings.height]

  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[settings.textAlignment]

  return (
    <section className={cn("relative flex w-full flex-col justify-center overflow-hidden", heightClass)}>
      {/* Video Background */}
      {settings.backgroundVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={settings.backgroundVideo}
          poster={settings.backgroundImage}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : settings.backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.backgroundImage})` }}
        />
      ) : null}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: settings.overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className={cn("relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-24 sm:px-6 lg:px-8", alignmentClass)}>
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h1"
          className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        />

        {settings.subheadline && (
          <EditableText
            blockId={blockId}
            fieldPath="subheadline"
            value={settings.subheadline}
            placeholder="Enter subheadline..."
            multiline
            as="p"
            className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl"
          />
        )}

        <div className={cn("mt-10 flex flex-wrap gap-4", settings.textAlignment === "center" && "justify-center")}>
          {settings.primaryCtaLink && (
            <Button size="lg" asChild>
              <Link href={settings.primaryCtaLink}>
                <EditableText
                  blockId={blockId}
                  fieldPath="primaryCtaText"
                  value={settings.primaryCtaText}
                  placeholder="Button text..."
                  as="span"
                />
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}

          {settings.secondaryCtaText && settings.secondaryCtaLink && (
            <Button size="lg" variant="secondary" asChild>
              <Link href={settings.secondaryCtaLink}>
                <EditableText
                  blockId={blockId}
                  fieldPath="secondaryCtaText"
                  value={settings.secondaryCtaText}
                  placeholder="Button text..."
                  as="span"
                />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
