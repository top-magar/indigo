import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import type { HeroBlock } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { formatCurrency } from "@/shared/utils"
import { EditableText } from "../../editable-text"

interface ProductShowcaseHeroProps {
  blockId: string
  settings: HeroBlock["settings"]
  product?: {
    id: string
    name: string
    price: number
    image: string
    slug: string
  }
}

export function ProductShowcaseHero({ blockId, settings, product }: ProductShowcaseHeroProps) {
  const heightClass = {
    full: "min-h-screen",
    large: "min-h-[80vh]",
    medium: "min-h-[60vh]",
  }[settings.height]

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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <EditableText
              blockId={blockId}
              fieldPath="headline"
              value={settings.headline}
              placeholder="Enter headline..."
              as="h1"
              className={cn(
                "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl",
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
                  "mt-6 max-w-xl text-lg sm:text-xl",
                  settings.backgroundImage ? "text-white/90" : "text-muted-foreground"
                )}
              />
            )}

            <div className="mt-10 flex flex-wrap gap-4">
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

          {/* Product Card */}
          {product && (
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-sm overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </p>
                  <Button className="mt-4 w-full" asChild>
                    <Link href={`/products/${product.slug}`}>
                      <HugeiconsIcon icon={ShoppingBag01Icon} className="mr-2 h-4 w-4" />
                      Shop Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
