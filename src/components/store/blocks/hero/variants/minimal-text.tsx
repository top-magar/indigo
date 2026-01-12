import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { HeroBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../../editable-text"

interface MinimalTextHeroProps {
  blockId: string
  settings: HeroBlock["settings"]
}

export function MinimalTextHero({ blockId, settings }: MinimalTextHeroProps) {
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
      className={cn(
        "relative flex w-full flex-col justify-center bg-linear-to-br from-muted/50 to-muted",
        heightClass
      )}
    >
      <div className={cn("mx-auto flex w-full max-w-5xl flex-col px-4 py-[68px] sm:px-6 lg:px-8", alignmentClass)}>
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h1"
          className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
        />

        {settings.subheadline && (
          <EditableText
            blockId={blockId}
            fieldPath="subheadline"
            value={settings.subheadline}
            placeholder="Enter subheadline..."
            multiline
            as="p"
            className="mt-[26px] max-w-2xl text-xl text-muted-foreground sm:text-2xl leading-[1.618]"
          />
        )}

        <div className={cn("mt-[42px] flex flex-wrap gap-[26px]", settings.textAlignment === "center" && "justify-center")}>
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
    </section>
  )
}
