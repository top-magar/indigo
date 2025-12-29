"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { CountdownBlock as CountdownBlockType } from "@/types/blocks"
import { EditableText } from "../editable-text"

interface CountdownBlockProps {
  block: CountdownBlockType
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const difference = new Date(endDate).getTime() - new Date().getTime()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  }
}

export function CountdownBlock({ block }: CountdownBlockProps) {
  const { variant, settings, id: blockId } = block

  switch (variant) {
    case "inline":
      return <InlineCountdown blockId={blockId} settings={settings} />
    case "banner":
      return <BannerCountdown blockId={blockId} settings={settings} />
    case "card":
      return <CardCountdown blockId={blockId} settings={settings} />
    case "minimal":
      return <MinimalCountdown blockId={blockId} settings={settings} />
    default:
      return <InlineCountdown blockId={blockId} settings={settings} />
  }
}

interface VariantProps {
  blockId: string
  settings: CountdownBlockType["settings"]
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return timeLeft
}

function TimeUnit({ value, label, size = "default" }: { value: number; label: string; size?: "default" | "large" }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-background font-mono font-bold tabular-nums",
          size === "large" ? "h-20 w-20 text-4xl" : "h-14 w-14 text-2xl"
        )}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className={cn("mt-1 text-xs uppercase tracking-wide", size === "large" ? "text-sm" : "text-xs")}>
        {label}
      </span>
    </div>
  )
}

function InlineCountdown({ blockId, settings }: VariantProps) {
  const { endDate, title, showDays, showHours, showMinutes, showSeconds, expiredMessage, ctaText, ctaLink } = settings
  const timeLeft = useCountdown(endDate)

  if (timeLeft.expired) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-muted-foreground">{expiredMessage}</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-4 text-center">
        {title && (
          <EditableText
            blockId={blockId}
            fieldPath="title"
            value={title}
            placeholder="Title..."
            as="h3"
            className="mb-4 text-lg font-semibold"
          />
        )}
        
        <div className="flex items-center justify-center gap-3">
          {showDays && <TimeUnit value={timeLeft.days} label="Days" />}
          {showHours && <TimeUnit value={timeLeft.hours} label="Hours" />}
          {showMinutes && <TimeUnit value={timeLeft.minutes} label="Min" />}
          {showSeconds && <TimeUnit value={timeLeft.seconds} label="Sec" />}
        </div>

        {ctaText && ctaLink && (
          <Button asChild className="mt-6">
            <a href={ctaLink}>{ctaText}</a>
          </Button>
        )}
      </div>
    </div>
  )
}

function BannerCountdown({ blockId, settings }: VariantProps) {
  const { endDate, title, subtitle, showDays, showHours, showMinutes, showSeconds, expiredMessage, backgroundColor, textColor, ctaText, ctaLink } = settings
  const timeLeft = useCountdown(endDate)

  if (timeLeft.expired) {
    return (
      <div
        className="py-6 text-center"
        style={{ backgroundColor: backgroundColor || "#000", color: textColor || "#fff" }}
      >
        <p className="text-lg">{expiredMessage}</p>
      </div>
    )
  }

  return (
    <div
      className="py-8"
      style={{ backgroundColor: backgroundColor || "#000", color: textColor || "#fff" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            {title && (
              <EditableText
                blockId={blockId}
                fieldPath="title"
                value={title}
                placeholder="Title..."
                as="h3"
                className="text-xl font-bold"
              />
            )}
            {subtitle && (
              <EditableText
                blockId={blockId}
                fieldPath="subtitle"
                value={subtitle}
                placeholder="Subtitle..."
                as="p"
                className="mt-1 opacity-80"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {showDays && <TimeUnit value={timeLeft.days} label="Days" />}
            {showHours && <TimeUnit value={timeLeft.hours} label="Hours" />}
            {showMinutes && <TimeUnit value={timeLeft.minutes} label="Min" />}
            {showSeconds && <TimeUnit value={timeLeft.seconds} label="Sec" />}
          </div>

          {ctaText && ctaLink && (
            <Button asChild variant="secondary" size="lg">
              <a href={ctaLink}>{ctaText}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function CardCountdown({ blockId, settings }: VariantProps) {
  const { endDate, title, subtitle, showDays, showHours, showMinutes, showSeconds, expiredMessage, backgroundColor, ctaText, ctaLink } = settings
  const timeLeft = useCountdown(endDate)

  return (
    <div className="py-12">
      <div className="mx-auto max-w-lg px-4">
        <div
          className="rounded-xl p-8 text-center shadow-lg"
          style={{ backgroundColor: backgroundColor || undefined }}
        >
          {title && (
            <EditableText
              blockId={blockId}
              fieldPath="title"
              value={title}
              placeholder="Title..."
              as="h3"
              className="text-2xl font-bold"
            />
          )}
          {subtitle && (
            <EditableText
              blockId={blockId}
              fieldPath="subtitle"
              value={subtitle}
              placeholder="Subtitle..."
              as="p"
              className="mt-2 text-muted-foreground"
            />
          )}

          {timeLeft.expired ? (
            <p className="mt-6 text-lg text-muted-foreground">{expiredMessage}</p>
          ) : (
            <>
              <div className="mt-6 flex items-center justify-center gap-4">
                {showDays && <TimeUnit value={timeLeft.days} label="Days" size="large" />}
                {showHours && <TimeUnit value={timeLeft.hours} label="Hours" size="large" />}
                {showMinutes && <TimeUnit value={timeLeft.minutes} label="Min" size="large" />}
                {showSeconds && <TimeUnit value={timeLeft.seconds} label="Sec" size="large" />}
              </div>

              {ctaText && ctaLink && (
                <Button asChild size="lg" className="mt-8">
                  <a href={ctaLink}>{ctaText}</a>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MinimalCountdown({ blockId, settings }: VariantProps) {
  const { endDate, showDays, showHours, showMinutes, showSeconds, expiredMessage, textColor } = settings
  const timeLeft = useCountdown(endDate)

  if (timeLeft.expired) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">{expiredMessage}</p>
      </div>
    )
  }

  const parts: string[] = []
  if (showDays && timeLeft.days > 0) parts.push(`${timeLeft.days}d`)
  if (showHours) parts.push(`${String(timeLeft.hours).padStart(2, "0")}h`)
  if (showMinutes) parts.push(`${String(timeLeft.minutes).padStart(2, "0")}m`)
  if (showSeconds) parts.push(`${String(timeLeft.seconds).padStart(2, "0")}s`)

  return (
    <div className="py-4 text-center">
      <span
        className="font-mono text-3xl font-bold tabular-nums tracking-wider"
        style={{ color: textColor || undefined }}
      >
        {parts.join(" : ")}
      </span>
    </div>
  )
}
