import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { HeroBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../../editable-text"

interface FullWidthHeroProps {
  blockId: string
  settings: HeroBlock["settings"]
}

export function FullWidthHero({ blockId, settings }: FullWidthHeroProps) {
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
    <section
      className={cn("relative flex w-full flex-col justify-center", heightClass)}
      style={{
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      {settings.backgroundImage && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: settings.overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      <div className={cn("relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 py-24 sm:px-6 lg:px-8", alignmentClass)}>
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h1"
          className={cn(
            "max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
            settings.backgroundImage ? "text-white" : "text-foreground"
          )}
        />

        {settings.subheadline && (
          <EditableText
            blockId={blockId}
            fieldPath="subheadline"
            value={settings.subheadline}
            placeholder="Enter subheadline..."
            multiline
            as="p"
            className={cn(
              "mt-6 max-w-2xl text-lg sm:text-xl",
              settings.backgroundImage ? "text-white/90" : "text-muted-foreground"
            )}
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
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}

          {settings.secondaryCtaText && settings.secondaryCtaLink && (
            <Button
              size="lg"
              variant={settings.backgroundImage ? "secondary" : "outline"}
              asChild
            >
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
