"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Copy, Check } from "lucide-react"
import type { PromoBannerBlock as PromoBannerBlockType } from "@/types/blocks"
import { cn } from "@/shared/utils"
import { EditableText } from "../editable-text"

interface PromoBannerBlockProps {
  block: PromoBannerBlockType
}

export function PromoBannerBlock({ block }: PromoBannerBlockProps) {
  const blockId = block.id
  
  switch (block.variant) {
    case "full-width":
      return <FullWidthBanner blockId={blockId} settings={block.settings} />
    case "split-image":
      return <SplitImageBanner blockId={blockId} settings={block.settings} />
    case "countdown":
      return <CountdownBanner blockId={blockId} settings={block.settings} />
    case "discount-code":
      return <DiscountCodeBanner blockId={blockId} settings={block.settings} />
    case "multi-offer":
      return <MultiOfferBanner blockId={blockId} settings={block.settings} />
    default:
      return <FullWidthBanner blockId={blockId} settings={block.settings} />
  }
}

function FullWidthBanner({ blockId, settings }: { blockId: string; settings: PromoBannerBlockType["settings"] }) {
  return (
    <section
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h2"
          className="text-3xl font-bold sm:text-4xl"
        />
        {settings.subtext && (
          <EditableText
            blockId={blockId}
            fieldPath="subtext"
            value={settings.subtext}
            placeholder="Enter subtext..."
            multiline
            as="p"
            className="mt-4 text-lg text-muted-foreground"
          />
        )}
        <Button size="lg" className="mt-8" asChild>
          <Link href={settings.ctaLink || "#"}>
            <EditableText
              blockId={blockId}
              fieldPath="ctaText"
              value={settings.ctaText}
              placeholder="Button text..."
              as="span"
            />
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

function SplitImageBanner({ blockId, settings }: { blockId: string; settings: PromoBannerBlockType["settings"] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="grid overflow-hidden rounded-2xl lg:grid-cols-2"
          style={{ backgroundColor: settings.backgroundColor || "hsl(var(--muted))" }}
        >
          {/* Content */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <EditableText
              blockId={blockId}
              fieldPath="headline"
              value={settings.headline}
              placeholder="Enter headline..."
              as="h2"
              className="text-3xl font-bold sm:text-4xl"
            />
            {settings.subtext && (
              <EditableText
                blockId={blockId}
                fieldPath="subtext"
                value={settings.subtext}
                placeholder="Enter subtext..."
                multiline
                as="p"
                className="mt-4 text-lg text-muted-foreground"
              />
            )}
            <Button size="lg" className="mt-8 w-fit" asChild>
              <Link href={settings.ctaLink || "#"}>
                <EditableText
                  blockId={blockId}
                  fieldPath="ctaText"
                  value={settings.ctaText}
                  placeholder="Button text..."
                  as="span"
                />
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Image */}
          {settings.backgroundImage && (
            <div className="relative aspect-[4/3] lg:aspect-auto">
              <Image
                src={settings.backgroundImage}
                alt={settings.headline}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CountdownBanner({ blockId, settings }: { blockId: string; settings: PromoBannerBlockType["settings"] }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  // Use settings with defaults
  const showDays = settings.showDays !== false
  const showHours = settings.showHours !== false
  const showMinutes = settings.showMinutes !== false
  const showSeconds = settings.showSeconds !== false
  const expiredMessage = settings.expiredMessage || "This offer has ended"

  useEffect(() => {
    if (!settings.countdownEnd) return

    const calculateTimeLeft = () => {
      const difference = new Date(settings.countdownEnd!).getTime() - new Date().getTime()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [settings.countdownEnd])

  // Show expired message if countdown has ended
  if (timeLeft.expired) {
    return (
      <section
        className="py-12"
        style={{ backgroundColor: settings.backgroundColor || "hsl(var(--primary))" }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xl font-semibold text-primary-foreground">{expiredMessage}</p>
        </div>
      </section>
    )
  }

  // Build countdown items based on settings
  const countdownItems = []
  if (showDays) countdownItems.push({ value: timeLeft.days, label: "Days" })
  if (showHours) countdownItems.push({ value: timeLeft.hours, label: "Hours" })
  if (showMinutes) countdownItems.push({ value: timeLeft.minutes, label: "Min" })
  if (showSeconds) countdownItems.push({ value: timeLeft.seconds, label: "Sec" })

  return (
    <section
      className="py-12"
      style={{ backgroundColor: settings.backgroundColor || "hsl(var(--primary))" }}
    >
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h2"
          className="text-2xl font-bold text-primary-foreground sm:text-3xl"
        />
        {settings.subtext && (
          <EditableText
            blockId={blockId}
            fieldPath="subtext"
            value={settings.subtext}
            placeholder="Enter subtext..."
            multiline
            as="p"
            className="mt-2 text-primary-foreground/90"
          />
        )}

        {/* Countdown */}
        <div className="mt-6 flex justify-center gap-4">
          {countdownItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-background text-2xl font-bold">
                {String(item.value).padStart(2, "0")}
              </div>
              <p className="mt-1 text-xs text-primary-foreground/80">{item.label}</p>
            </div>
          ))}
        </div>

        <Button size="lg" variant="secondary" className="mt-8" asChild>
          <Link href={settings.ctaLink || "#"}>
            <EditableText
              blockId={blockId}
              fieldPath="ctaText"
              value={settings.ctaText}
              placeholder="Button text..."
              as="span"
            />
          </Link>
        </Button>
      </div>
    </section>
  )
}

function DiscountCodeBanner({ blockId, settings }: { blockId: string; settings: PromoBannerBlockType["settings"] }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    if (settings.discountCode) {
      navigator.clipboard.writeText(settings.discountCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section
      className="py-12"
      style={{ backgroundColor: settings.backgroundColor || "hsl(var(--muted))" }}
    >
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <EditableText
          blockId={blockId}
          fieldPath="headline"
          value={settings.headline}
          placeholder="Enter headline..."
          as="h2"
          className="text-2xl font-bold sm:text-3xl"
        />
        {settings.subtext && (
          <EditableText
            blockId={blockId}
            fieldPath="subtext"
            value={settings.subtext}
            placeholder="Enter subtext..."
            multiline
            as="p"
            className="mt-2 text-muted-foreground"
          />
        )}

        {/* Discount Code */}
        {settings.discountCode && (
          <button
            onClick={copyCode}
            className="mt-6 inline-flex items-center gap-3 rounded-lg border-2 border-dashed border-primary bg-background px-6 py-3 transition-colors hover:bg-muted"
          >
            <EditableText
              blockId={blockId}
              fieldPath="discountCode"
              value={settings.discountCode}
              placeholder="CODE"
              as="span"
              className="font-mono text-xl font-bold tracking-wider"
            />
            {copied ? (
              <Check className={cn("h-5 w-5", "text-chart-2")} />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          {copied ? "Copied to clipboard!" : "Click to copy code"}
        </p>

        <Button size="lg" className="mt-6" asChild>
          <Link href={settings.ctaLink || "#"}>
            <EditableText
              blockId={blockId}
              fieldPath="ctaText"
              value={settings.ctaText}
              placeholder="Button text..."
              as="span"
            />
          </Link>
        </Button>
      </div>
    </section>
  )
}

function MultiOfferBanner({ blockId, settings }: { blockId: string; settings: PromoBannerBlockType["settings"] }) {
  const offers = settings.offers || []

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {settings.headline && (
          <EditableText
            blockId={blockId}
            fieldPath="headline"
            value={settings.headline}
            placeholder="Enter headline..."
            as="h2"
            className="mb-8 text-center text-2xl font-bold"
          />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <Card
              key={index}
              className="overflow-hidden"
              style={{ backgroundColor: settings.backgroundColor }}
            >
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold">{offer.headline}</h3>
                <p className="mt-2 text-muted-foreground">{offer.subtext}</p>
                <Button className="mt-4" asChild>
                  <Link href={offer.ctaLink || "#"}>{offer.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
