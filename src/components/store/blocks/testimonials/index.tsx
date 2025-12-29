"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, QuoteDownIcon } from "@hugeicons/core-free-icons"
import type { TestimonialsBlock as TestimonialsBlockType } from "@/types/blocks"
import { cn } from "@/lib/utils"
import { EditableText } from "../editable-text"

interface TestimonialsBlockProps {
  block: TestimonialsBlockType
}

export function TestimonialsBlock({ block }: TestimonialsBlockProps) {
  const blockId = block.id

  switch (block.variant) {
    case "carousel":
      return <CarouselTestimonials blockId={blockId} settings={block.settings} />
    case "grid":
      return <GridTestimonials blockId={blockId} settings={block.settings} />
    case "featured":
      return <FeaturedTestimonial blockId={blockId} settings={block.settings} />
    case "video":
      return <VideoTestimonials blockId={blockId} settings={block.settings} />
    case "aggregate":
      return <AggregateReviews blockId={blockId} settings={block.settings} />
    default:
      return <CarouselTestimonials blockId={blockId} settings={block.settings} />
  }
}

interface VariantProps {
  blockId: string
  settings: TestimonialsBlockType["settings"]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            "h-4 w-4",
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

function CarouselTestimonials({ blockId, settings }: VariantProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const reviews = settings.manualReviews || []

  const next = () => setCurrentIndex((i) => (i + 1) % reviews.length)
  const prev = () => setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length)

  if (reviews.length === 0) return null

  const review = reviews[currentIndex]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {settings.sectionTitle && (
          <EditableText
            blockId={blockId}
            fieldPath="sectionTitle"
            value={settings.sectionTitle}
            placeholder="Section title..."
            as="h2"
            className="mb-12 text-center text-2xl font-bold"
          />
        )}

        <div className="relative">
          <Card className="border-0 bg-muted/50">
            <CardContent className="p-8 text-center sm:p-12">
              <HugeiconsIcon icon={QuoteDownIcon} className="mx-auto h-10 w-10 text-primary/20" />

              <blockquote className="mt-6 text-xl font-medium sm:text-2xl">
                &ldquo;{review.quote}&rdquo;
              </blockquote>

              <div className="mt-8 flex flex-col items-center gap-3">
                {settings.showPhotos && review.avatar && (
                  <Image
                    src={review.avatar}
                    alt={review.author}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{review.author}</p>
                  {review.role && (
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  )}
                </div>
                {settings.showRatings && review.rating && (
                  <StarRating rating={review.rating} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          {reviews.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" size="icon" onClick={prev}>
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      i === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={next}>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function GridTestimonials({ blockId, settings }: VariantProps) {
  const reviews = (settings.manualReviews || []).slice(0, settings.reviewsToShow)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {settings.sectionTitle && (
          <EditableText
            blockId={blockId}
            fieldPath="sectionTitle"
            value={settings.sectionTitle}
            placeholder="Section title..."
            as="h2"
            className="mb-12 text-center text-2xl font-bold"
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                {settings.showRatings && review.rating && (
                  <StarRating rating={review.rating} />
                )}
                <blockquote className="mt-4 text-muted-foreground">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  {settings.showPhotos && review.avatar && (
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{review.author}</p>
                    {review.role && (
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedTestimonial({ blockId, settings }: VariantProps) {
  const review = settings.manualReviews?.[0]
  if (!review) return null

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {settings.sectionTitle && (
          <EditableText
            blockId={blockId}
            fieldPath="sectionTitle"
            value={settings.sectionTitle}
            placeholder="Section title..."
            as="h2"
            className="mb-12 text-center text-2xl font-bold"
          />
        )}

        <div className="flex flex-col items-center text-center">
          {settings.showPhotos && review.avatar && (
            <Image
              src={review.avatar}
              alt={review.author}
              width={96}
              height={96}
              className="rounded-full"
            />
          )}

          {settings.showRatings && review.rating && (
            <div className="mt-6">
              <StarRating rating={review.rating} />
            </div>
          )}

          <blockquote className="mt-6 text-2xl font-medium leading-relaxed sm:text-3xl">
            &ldquo;{review.quote}&rdquo;
          </blockquote>

          <div className="mt-8">
            <p className="text-lg font-semibold">{review.author}</p>
            {review.role && (
              <p className="text-muted-foreground">{review.role}</p>
            )}
            {settings.showProduct && review.productName && (
              <p className="mt-2 text-sm text-primary">Purchased: {review.productName}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function VideoTestimonials({ blockId, settings }: VariantProps) {
  const videos = settings.videoUrls || []

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {settings.sectionTitle && (
          <EditableText
            blockId={blockId}
            fieldPath="sectionTitle"
            value={settings.sectionTitle}
            placeholder="Section title..."
            as="h2"
            className="mb-12 text-center text-2xl font-bold"
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.slice(0, settings.reviewsToShow).map((url, index) => (
            <div key={index} className="aspect-video overflow-hidden rounded-lg bg-muted">
              <video
                src={url}
                controls
                className="h-full w-full object-cover"
                poster=""
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AggregateReviews({ blockId, settings }: VariantProps) {
  const reviews = settings.manualReviews || []
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {settings.sectionTitle && (
          <EditableText
            blockId={blockId}
            fieldPath="sectionTitle"
            value={settings.sectionTitle}
            placeholder="Section title..."
            as="h2"
            className="mb-8 text-center text-2xl font-bold"
          />
        )}

        {/* Aggregate Stats */}
        <div className="mb-12 flex flex-col items-center">
          <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
          <div className="mt-2">
            <StarRating rating={Math.round(avgRating)} />
          </div>
          <p className="mt-2 text-muted-foreground">
            Based on {reviews.length} reviews
          </p>
        </div>

        {/* Sample Reviews */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                {settings.showRatings && review.rating && (
                  <StarRating rating={review.rating} />
                )}
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <p className="mt-2 text-sm font-medium">{review.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
