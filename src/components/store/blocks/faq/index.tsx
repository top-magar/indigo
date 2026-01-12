"use client"

import { useState, useMemo } from "react"
import { cn } from "@/shared/utils"
import { Plus, Minus, Search } from "lucide-react"
import type { FAQBlock as FAQBlockType } from "@/types/blocks"
import { EditableText } from "../editable-text"

interface FAQBlockProps {
  block: FAQBlockType
}

export function FAQBlock({ block }: FAQBlockProps) {
  const { variant, settings, id: blockId } = block

  switch (variant) {
    case "accordion":
      return <AccordionFAQ blockId={blockId} settings={settings} />
    case "grid":
      return <GridFAQ blockId={blockId} settings={settings} />
    case "simple":
      return <SimpleFAQ blockId={blockId} settings={settings} />
    case "searchable":
      return <SearchableFAQ blockId={blockId} settings={settings} />
    default:
      return <AccordionFAQ blockId={blockId} settings={settings} />
  }
}

interface VariantProps {
  blockId: string
  settings: FAQBlockType["settings"]
}

function AccordionFAQ({ blockId, settings }: VariantProps) {
  const { title, subtitle, allowMultipleOpen, defaultOpenFirst } = settings
  const items = (settings.items || []).filter(item => item != null)
  const [openItems, setOpenItems] = useState<number[]>(defaultOpenFirst ? [0] : [])

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      )
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {title && (
          <EditableText
            blockId={blockId}
            fieldPath="title"
            value={title}
            placeholder="Section title..."
            as="h2"
            className="mb-4 text-center text-2xl font-bold"
          />
        )}
        {subtitle && (
          <EditableText
            blockId={blockId}
            fieldPath="subtitle"
            value={subtitle}
            placeholder="Subtitle..."
            as="p"
            className="mb-8 text-center text-muted-foreground"
          />
        )}

        <div className="divide-y divide-border rounded-xl border">
          {items.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-muted/50"
              >
                <span className="font-medium">{item.question}</span>
                {openItems.includes(index) ? (
                  <Minus className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GridFAQ({ blockId, settings }: VariantProps) {
  const { title, subtitle, columns } = settings
  const items = (settings.items || []).filter(item => item != null)

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {title && (
          <EditableText
            blockId={blockId}
            fieldPath="title"
            value={title}
            placeholder="Section title..."
            as="h2"
            className="mb-4 text-center text-2xl font-bold"
          />
        )}
        {subtitle && (
          <EditableText
            blockId={blockId}
            fieldPath="subtitle"
            value={subtitle}
            placeholder="Subtitle..."
            as="p"
            className="mb-8 text-center text-muted-foreground"
          />
        )}

        <div className={cn("grid gap-6", columns === 2 ? "md:grid-cols-2" : "grid-cols-1")}>
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border p-6">
              <h3 className="mb-2 font-semibold">{item.question}</h3>
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SimpleFAQ({ blockId, settings }: VariantProps) {
  const { title, subtitle } = settings
  const items = (settings.items || []).filter(item => item != null)

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {title && (
          <EditableText
            blockId={blockId}
            fieldPath="title"
            value={title}
            placeholder="Section title..."
            as="h2"
            className="mb-4 text-center text-2xl font-bold"
          />
        )}
        {subtitle && (
          <EditableText
            blockId={blockId}
            fieldPath="subtitle"
            value={subtitle}
            placeholder="Subtitle..."
            as="p"
            className="mb-8 text-center text-muted-foreground"
          />
        )}

        <div className="space-y-8">
          {items.map((item, index) => (
            <div key={index}>
              <h3 className="mb-2 text-lg font-semibold">{item.question}</h3>
              <p className="text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SearchableFAQ({ blockId, settings }: VariantProps) {
  const { title, subtitle, allowMultipleOpen, defaultOpenFirst } = settings
  const items = (settings.items || []).filter(item => item != null)
  const [search, setSearch] = useState("")
  const [openItems, setOpenItems] = useState<number[]>(defaultOpenFirst ? [0] : [])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const query = search.toLowerCase()
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    )
  }, [items, search])

  const toggleItem = (index: number) => {
    if (allowMultipleOpen) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      )
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {title && (
          <EditableText
            blockId={blockId}
            fieldPath="title"
            value={title}
            placeholder="Section title..."
            as="h2"
            className="mb-4 text-center text-2xl font-bold"
          />
        )}
        {subtitle && (
          <EditableText
            blockId={blockId}
            fieldPath="subtitle"
            value={subtitle}
            placeholder="Subtitle..."
            as="p"
            className="mb-6 text-center text-muted-foreground"
          />
        )}

        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="divide-y divide-border rounded-xl border">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No questions found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-muted/50"
                >
                  <span className="font-medium">{item.question}</span>
                  {openItems.includes(index) ? (
                    <Minus className="h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-4 pb-4 text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
