"use client"

import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { Section, TextField, SliderField, SelectField, ColorField } from "../components/editor-fields"
import { UniversalStyleControls } from "../components/universal-style-controls"

interface CollectionItem {
  title: string
  image: string
  href: string
}

interface CollectionListProps {
  _v: number
  heading: string
  columns: 2 | 3 | 4
  collections: string // JSON stringified CollectionItem[]
  cardStyle: "overlay" | "below"
  backgroundColor: string
  textColor: string
  padding: number
}

const defaultCollections: CollectionItem[] = [
  { title: "New Arrivals", image: "", href: "/products?category=new" },
  { title: "Best Sellers", image: "", href: "/products?category=best" },
  { title: "On Sale", image: "", href: "/products?category=sale" },
]

const parseCollections = (raw: string): CollectionItem[] => {
  try { return JSON.parse(raw) } catch { return defaultCollections }
}

export const CollectionListBlock = (props: CollectionListProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { heading, columns, collections: collectionsJson, cardStyle, backgroundColor, textColor, padding } = props
  const collections = parseCollections(collectionsJson)

  return (
    <div ref={craftRef(connect, drag)} style={{ padding, backgroundColor, color: textColor }}>
      {heading && (
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px", textAlign: "center", fontFamily: "var(--store-font-heading)" }}>{heading}</h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 16 }}>
        {collections.map((col, i) => (
          <div key={i} style={{ position: "relative", borderRadius: "var(--store-radius, 8px)", overflow: "hidden", aspectRatio: "3/4", backgroundColor: "#e5e7eb", cursor: "pointer" }}>
            {col.image && <img src={col.image} alt={col.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            {cardStyle === "overlay" ? (
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: 20 }}>
                <span style={{ color: "#fff", fontSize: 18, fontWeight: 600, fontFamily: "var(--store-font-heading)" }}>{col.title}</span>
              </div>
            ) : (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(4px)" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{col.title}</span>
              </div>
            )}
          </div>
        ))}
      </div>
          <UniversalStyleControls />
    </div>
  )
}

const CollectionListSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as CollectionListProps }))
  if (!props) return null
  const collections = parseCollections(props.collections)

  const updateCollection = (index: number, key: keyof CollectionItem, value: string) => {
    const updated = [...collections]
    updated[index] = { ...updated[index], [key]: value }
    setProp((p: CollectionListProps) => { p.collections = JSON.stringify(updated) })
  }

  const addCollection = () => {
    const updated = [...collections, { title: `Collection ${collections.length + 1}`, image: "", href: "#" }]
    setProp((p: CollectionListProps) => { p.collections = JSON.stringify(updated) })
  }

  const removeCollection = (index: number) => {
    if (collections.length <= 1) return
    setProp((p: CollectionListProps) => { p.collections = JSON.stringify(collections.filter((_, i) => i !== index)) })
  }

  const set = <K extends keyof CollectionListProps>(k: K, v: CollectionListProps[K]) => setProp((p: CollectionListProps) => { (p as unknown as Record<string, unknown>)[k] = v })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title="Content">
        <TextField label="Heading" value={props.heading} onChange={(v) => set("heading", v)} />
        <SelectField label="Columns" value={String(props.columns)} onChange={(v) => set("columns", +v as 2 | 3 | 4)} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
        <SelectField label="Card Style" value={props.cardStyle} onChange={(v) => set("cardStyle", v as "overlay" | "below")} options={[{ value: "overlay", label: "Text Overlay" }, { value: "below", label: "Text Below" }]} />
      </Section>
      <Section title={`Collections (${collections.length})`}>
        {collections.map((col, i) => (
          <div key={i} className="rounded border border-border/50 p-2 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
              {collections.length > 1 && (
                <button onClick={() => removeCollection(i)} className="text-[9px] text-destructive hover:underline">Remove</button>
              )}
            </div>
            <TextField label="Title" value={col.title} onChange={(v) => updateCollection(i, "title", v)} />
            <TextField label="Link" value={col.href} onChange={(v) => updateCollection(i, "href", v)} />
          </div>
        ))}
        <button onClick={addCollection} className="w-full rounded bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent">
          + Add Collection
        </button>
      </Section>
      <Section title="Style">
        <SliderField label="Padding" value={props.padding} onChange={(v) => set("padding", v)} min={0} max={80} />
        <ColorField label="Background" value={props.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
        <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
      </Section>
          <UniversalStyleControls />
    </div>
  )
}

CollectionListBlock.craft = {
  displayName: "Collection List",
  props: { _v: 1, heading: "Shop by Category", columns: 3, collections: JSON.stringify(defaultCollections), cardStyle: "overlay", backgroundColor: "transparent", textColor: "#000000", padding: 48 } as CollectionListProps,
  rules: { canMoveIn: () => false },
  related: { settings: CollectionListSettings },
}
