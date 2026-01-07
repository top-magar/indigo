"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingCart01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import type { FeaturedProductBlock as FeaturedProductBlockType } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../editable-text"

// Simple price formatter
function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  image: string
  images?: string[]
  rating?: number
  reviewCount?: number
  stock?: number
}

interface FeaturedProductBlockProps {
  block: FeaturedProductBlockType
  product: FeaturedProduct
  storeSlug: string
  currency?: string
}

export function FeaturedProductBlock({ block, product, storeSlug, currency = "USD" }: FeaturedProductBlockProps) {
  const props = { blockId: block.id, settings: block.settings, product, storeSlug, currency }

  switch (block.variant) {
    case "large-image":
      return <LargeImageVariant {...props} />
    case "gallery":
      return <GalleryVariant {...props} />
    case "lifestyle":
      return <LifestyleVariant {...props} />
    case "comparison":
      return <ComparisonVariant {...props} />
    case "urgency":
      return <UrgencyVariant {...props} />
    default:
      return <LargeImageVariant {...props} />
  }
}

interface VariantProps {
  blockId: string
  settings: FeaturedProductBlockType["settings"]
  product: FeaturedProduct
  storeSlug: string
  currency: string
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground/30"
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function LargeImageVariant({ blockId, settings, product, storeSlug, currency }: VariantProps) {
  return (
    <section className="py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-5">
          <div className="relative aspect-square overflow-hidden rounded-2xl lg:col-span-3">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            {settings.badgeText && (
              <Badge className="absolute left-4 top-4">
                <EditableText
                  blockId={blockId}
                  fieldPath="badgeText"
                  value={settings.badgeText}
                  placeholder="Badge..."
                  as="span"
                />
              </Badge>
            )}
          </div>

          <div className="lg:col-span-2">
            <EditableText
              blockId={blockId}
              fieldPath="customHeadline"
              value={settings.customHeadline || product.name}
              placeholder="Enter headline..."
              as="h2"
              className="text-3xl font-bold sm:text-4xl"
            />

            {settings.showReviews && product.rating && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            )}

            <EditableText
              blockId={blockId}
              fieldPath="customDescription"
              value={settings.customDescription || product.description || ""}
              placeholder="Enter description..."
              multiline
              as="p"
              className="mt-4 text-muted-foreground"
            />

            {settings.showPrice && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-bold">{formatPrice(product.price, currency)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                )}
              </div>
            )}

            <Button size="lg" className="mt-8" asChild>
              <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function GalleryVariant({ blockId, settings, product, storeSlug, currency }: VariantProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const images = product.images?.length ? product.images : [product.image]

  return (
    <section className="py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl">
              <Image src={images[selectedImage]} alt={product.name} fill className="object-cover" />
              {settings.badgeText && (
                <Badge className="absolute left-4 top-4">
                  <EditableText
                    blockId={blockId}
                    fieldPath="badgeText"
                    value={settings.badgeText}
                    placeholder="Badge..."
                    as="span"
                  />
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                      i === selectedImage ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <EditableText
              blockId={blockId}
              fieldPath="customHeadline"
              value={settings.customHeadline || product.name}
              placeholder="Enter headline..."
              as="h2"
              className="text-3xl font-bold"
            />

            {settings.showReviews && product.rating && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            )}

            <EditableText
              blockId={blockId}
              fieldPath="customDescription"
              value={settings.customDescription || product.description || ""}
              placeholder="Enter description..."
              multiline
              as="p"
              className="mt-4 text-muted-foreground"
            />

            {settings.showPrice && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-bold">{formatPrice(product.price, currency)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                )}
              </div>
            )}

            <Button size="lg" className="mt-8 w-fit" asChild>
              <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-5 w-5" />
                Add to Cart
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function LifestyleVariant({ blockId, settings, product, storeSlug, currency }: VariantProps) {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0">
        <Image src={product.image} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              {settings.badgeText && (
                <Badge className="mb-4">
                  <EditableText
                    blockId={blockId}
                    fieldPath="badgeText"
                    value={settings.badgeText}
                    placeholder="Badge..."
                    as="span"
                  />
                </Badge>
              )}
              <EditableText
                blockId={blockId}
                fieldPath="customHeadline"
                value={settings.customHeadline || product.name}
                placeholder="Enter headline..."
                as="h2"
                className="text-2xl font-bold"
              />

              {settings.showReviews && product.rating && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                </div>
              )}

              <EditableText
                blockId={blockId}
                fieldPath="customDescription"
                value={settings.customDescription || product.description || ""}
                placeholder="Enter description..."
                multiline
                as="p"
                className="mt-3 text-sm text-muted-foreground line-clamp-3"
              />

              {settings.showPrice && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-2xl font-bold">{formatPrice(product.price, currency)}</span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice, currency)}
                    </span>
                  )}
                </div>
              )}

              <Button className="mt-6 w-full" asChild>
                <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                  <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-4 w-4" />
                  Shop Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ComparisonVariant({ blockId, settings, product, storeSlug, currency }: VariantProps) {
  const benefits = [
    { icon: Tick01Icon, text: "Premium quality materials" },
    { icon: Tick01Icon, text: "Handcrafted with care" },
    { icon: Tick01Icon, text: "Sustainable production" },
    { icon: Tick01Icon, text: "Lifetime warranty" },
  ]

  return (
    <section className="py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center">
            <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-2xl">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              {settings.badgeText && (
                <Badge className="absolute left-4 top-4">
                  <EditableText
                    blockId={blockId}
                    fieldPath="badgeText"
                    value={settings.badgeText}
                    placeholder="Badge..."
                    as="span"
                  />
                </Badge>
              )}
            </div>
            <EditableText
              blockId={blockId}
              fieldPath="customHeadline"
              value={settings.customHeadline || product.name}
              placeholder="Enter headline..."
              as="h2"
              className="mt-6 text-2xl font-bold"
            />
            {settings.showPrice && (
              <p className="mt-2 text-2xl font-bold text-primary">
                {formatPrice(product.price, currency)}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold">Why Choose This Product?</h3>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10">
                    <HugeiconsIcon icon={benefit.icon} className="h-5 w-5 text-chart-2" />
                  </div>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8" asChild>
              <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-5 w-5" />
                Add to Cart
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function UrgencyVariant({ blockId, settings, product, storeSlug, currency }: VariantProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!settings.showCountdown || !settings.countdownEnd) return

    const calculateTimeLeft = () => {
      const difference = new Date(settings.countdownEnd!).getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [settings.showCountdown, settings.countdownEnd])

  return (
    <section className="py-16 bg-destructive/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
            <Badge variant="destructive" className="absolute left-4 top-4">
              <EditableText
                blockId={blockId}
                fieldPath="badgeText"
                value={settings.badgeText || "Limited Edition"}
                placeholder="Badge..."
                as="span"
              />
            </Badge>
          </div>

          <div>
            <Badge variant="outline" className="mb-4 border-destructive text-destructive">
              Only {product.stock || 5} left in stock!
            </Badge>

            <EditableText
              blockId={blockId}
              fieldPath="customHeadline"
              value={settings.customHeadline || product.name}
              placeholder="Enter headline..."
              as="h2"
              className="text-3xl font-bold"
            />

            {settings.showPrice && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-bold text-destructive">
                  {formatPrice(product.price, currency)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                )}
              </div>
            )}

            {settings.showCountdown && (
              <div className="mt-6">
                <p className="text-sm font-medium text-destructive">Offer ends in:</p>
                <div className="mt-2 flex gap-3">
                  {[
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Min" },
                    { value: timeLeft.seconds, label: "Sec" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-destructive text-xl font-bold text-destructive-foreground">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button size="lg" variant="destructive" className="mt-8" asChild>
              <Link href={`/store/${storeSlug}/products/${product.slug}`}>
                <HugeiconsIcon icon={ShoppingCart01Icon} className="mr-2 h-5 w-5" />
                Buy Now - Don&apos;t Miss Out!
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
