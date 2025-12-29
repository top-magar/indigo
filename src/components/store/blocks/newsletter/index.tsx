"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import type { NewsletterBlock as NewsletterBlockType } from "@/types/blocks"
import { cn } from "@/lib/utils"
import { EditableText } from "../editable-text"

interface NewsletterBlockProps {
  block: NewsletterBlockType
  onSubscribe?: (email: string, name?: string) => Promise<void>
}

export function NewsletterBlock({ block, onSubscribe }: NewsletterBlockProps) {
  const blockId = block.id
  
  switch (block.variant) {
    case "inline":
      return <InlineNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
    case "card":
      return <CardNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
    case "split-image":
      return <SplitImageNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
    case "full-width":
      return <FullWidthNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
    case "multi-field":
      return <MultiFieldNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
    default:
      return <InlineNewsletter blockId={blockId} settings={block.settings} onSubscribe={onSubscribe} />
  }
}

interface NewsletterFormProps {
  blockId: string
  settings: NewsletterBlockType["settings"]
  onSubscribe?: (email: string, name?: string) => Promise<void>
}

function InlineNewsletter({ blockId, settings, onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubscribe?.(email)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-chart-2">
            <HugeiconsIcon icon={Tick01Icon} className="h-5 w-5" />
            <span>{settings.successMessage}</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <EditableText
            blockId={blockId}
            fieldPath="headline"
            value={settings.headline}
            placeholder="Enter headline..."
            as="span"
            className="font-medium"
          />
          <div className="flex w-full max-w-md gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <EditableText
                blockId={blockId}
                fieldPath="buttonText"
                value={settings.buttonText}
                placeholder="Subscribe"
                as="span"
              />
            </Button>
          </div>
        </form>
        {settings.privacyText && (
          <p className="mt-2 text-center text-xs text-muted-foreground">{settings.privacyText}</p>
        )}
      </div>
    </section>
  )
}

function CardNewsletter({ blockId, settings, onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubscribe?.(email)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <Card style={{ backgroundColor: settings.backgroundColor }}>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <HugeiconsIcon icon={Mail01Icon} className="h-6 w-6 text-primary" />
            </div>

            <EditableText
              blockId={blockId}
              fieldPath="headline"
              value={settings.headline}
              placeholder="Enter headline..."
              as="h2"
              className="mt-4 text-2xl font-bold"
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

            {submitted ? (
              <div className="mt-6 flex items-center justify-center gap-2 text-chart-2">
                <HugeiconsIcon icon={Tick01Icon} className="h-5 w-5" />
                <span>{settings.successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  <EditableText
                    blockId={blockId}
                    fieldPath="buttonText"
                    value={settings.buttonText}
                    placeholder="Subscribe"
                    as="span"
                  />
                </Button>
              </form>
            )}

            {settings.privacyText && (
              <p className="mt-4 text-xs text-muted-foreground">{settings.privacyText}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function SplitImageNewsletter({ blockId, settings, onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubscribe?.(email)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-muted lg:grid-cols-2">
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

          {/* Form */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
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

            {submitted ? (
              <div className="mt-6 flex items-center gap-2 text-chart-2">
                <HugeiconsIcon icon={Tick01Icon} className="h-5 w-5" />
                <span>{settings.successMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading}>
                  <EditableText
                    blockId={blockId}
                    fieldPath="buttonText"
                    value={settings.buttonText}
                    placeholder="Subscribe"
                    as="span"
                  />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function FullWidthNewsletter({ blockId, settings, onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubscribe?.(email)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor || "hsl(var(--primary))" }}
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
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
            className="mt-2 text-primary-foreground/80"
          />
        )}

        {submitted ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-primary-foreground">
            <HugeiconsIcon icon={Tick01Icon} className="h-5 w-5" />
            <span>{settings.successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background sm:w-80"
            />
            <Button type="submit" variant="secondary" disabled={loading}>
              <EditableText
                blockId={blockId}
                fieldPath="buttonText"
                value={settings.buttonText}
                placeholder="Subscribe"
                as="span"
              />
            </Button>
          </form>
        )}

        {settings.privacyText && (
          <p className="mt-4 text-xs text-primary-foreground/60">{settings.privacyText}</p>
        )}
      </div>
    </section>
  )
}

function MultiFieldNewsletter({ blockId, settings, onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubscribe?.(email, name)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <EditableText
            blockId={blockId}
            fieldPath="headline"
            value={settings.headline}
            placeholder="Enter headline..."
            as="h2"
            className="text-2xl font-bold"
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
        </div>

        {submitted ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-chart-2">
            <HugeiconsIcon icon={Tick01Icon} className="h-5 w-5" />
            <span>{settings.successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {settings.collectName && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <EditableText
                blockId={blockId}
                fieldPath="buttonText"
                value={settings.buttonText}
                placeholder="Subscribe"
                as="span"
              />
            </Button>
          </form>
        )}

        {settings.privacyText && (
          <p className="mt-4 text-center text-xs text-muted-foreground">{settings.privacyText}</p>
        )}
      </div>
    </section>
  )
}
