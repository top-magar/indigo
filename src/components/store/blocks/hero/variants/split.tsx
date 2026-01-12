import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { HeroBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../../editable-text"

interface SplitHeroProps {
  blockId: string
  settings: HeroBlock["settings"]
}

export function SplitHero({ blockId, settings }: SplitHeroProps) {
  const heightClass = {
    full: "min-h-screen",
    large: "min-h-[80vh]",
    medium: "min-h-[60vh]",
  }[settings.height]

  return (
    <section className={cn("relative w-full", heightClass)}>
      <div className="mx-auto grid h-full max-w-7xl lg:grid-cols-[1fr_1.618fr]">
        {/* Content */}
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-[52px]">
          <EditableText
            blockId={blockId}
            fieldPath="headline"
            value={settings.headline}
            placeholder="Enter headline..."
            as="h1"
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          />

          {settings.subheadline && (
            <EditableText
              blockId={blockId}
              fieldPath="subheadline"
              value={settings.subheadline}
              placeholder="Enter subheadline..."
              multiline
              as="p"
              className="mt-[26px] max-w-xl text-lg text-muted-foreground sm:text-xl leading-[1.618]"
            />
          )}

          <div className="mt-[42px] flex flex-wrap gap-[26px]">
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
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}

            {settings.secondaryCtaText && settings.secondaryCtaLink && (
              <Button size="lg" variant="outline" asChild>
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

        {/* Image */}
        <div className="relative hidden lg:block">
          {settings.backgroundImage ? (
            <Image
              src={settings.backgroundImage}
              alt={settings.headline}
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>

        {/* Mobile Image */}
        {settings.backgroundImage && (
          <div className="relative aspect-[4/3] lg:hidden">
            <Image
              src={settings.backgroundImage}
              alt={settings.headline}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
      </div>
    </section>
  )
}
