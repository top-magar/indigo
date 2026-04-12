"use client"

import { useState } from "react"
import { useEditorStore } from "../../store"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const PROP_MAP: Record<string, string> = {
  paddingTop: "padding-top", paddingBottom: "padding-bottom", paddingLeft: "padding-left", paddingRight: "padding-right",
  marginTop: "margin-top", marginBottom: "margin-bottom", maxWidth: "max-width", backgroundColor: "background-color",
  textColor: "color", fontSize: "font-size", textAlign: "text-align", borderRadius: "border-radius",
  borderWidth: "border-width", borderColor: "border-color", opacity: "opacity", gap: "gap",
  flexDirection: "flex-direction", alignItems: "align-items", justifyContent: "justify-content",
  fontFamily: "font-family", fontWeight: "font-weight", lineHeight: "line-height", letterSpacing: "letter-spacing",
}
const PX_PROPS = new Set(["padding-top", "padding-bottom", "padding-left", "padding-right", "margin-top", "margin-bottom", "max-width", "font-size", "border-radius", "border-width", "gap", "letter-spacing"])
const TW: Record<string, Record<string | number, string>> = {
  paddingTop: { 0: "pt-0", 4: "pt-1", 8: "pt-2", 12: "pt-3", 16: "pt-4", 20: "pt-5", 24: "pt-6", 32: "pt-8", 48: "pt-12", 64: "pt-16" },
  paddingBottom: { 0: "pb-0", 4: "pb-1", 8: "pb-2", 12: "pb-3", 16: "pb-4", 20: "pb-5", 24: "pb-6", 32: "pb-8", 48: "pb-12", 64: "pb-16" },
  paddingLeft: { 0: "pl-0", 4: "pl-1", 8: "pl-2", 16: "pl-4", 24: "pl-6", 32: "pl-8" },
  paddingRight: { 0: "pr-0", 4: "pr-1", 8: "pr-2", 16: "pr-4", 24: "pr-6", 32: "pr-8" },
  gap: { 0: "gap-0", 4: "gap-1", 8: "gap-2", 12: "gap-3", 16: "gap-4", 24: "gap-6", 32: "gap-8" },
  fontSize: { 12: "text-xs", 14: "text-sm", 16: "text-base", 18: "text-lg", 20: "text-xl", 24: "text-2xl", 30: "text-3xl", 36: "text-4xl" },
  textAlign: { left: "text-left", center: "text-center", right: "text-right" },
  fontWeight: { 400: "font-normal", 500: "font-medium", 600: "font-semibold", 700: "font-bold" },
  borderRadius: { 0: "rounded-none", 4: "rounded", 8: "rounded-lg", 12: "rounded-xl", 9999: "rounded-full" },
}
const TW_COLORS: Record<string, string> = { "#3b82f6": "blue-500", "#ef4444": "red-500", "#22c55e": "green-500", "#f59e0b": "amber-500", "#8b5cf6": "violet-500", "#000000": "black", "#ffffff": "white", "#f3f4f6": "gray-100", "#1f2937": "gray-800" }

function g(props: Record<string, unknown>, k: string): unknown { return props[`_${k}`] }
function n(props: Record<string, unknown>, k: string): number { return (g(props, k) as number) ?? 0 }

function buildCSS(props: Record<string, unknown>): string {
  const lines: string[] = []
  for (const [key, val] of Object.entries(props)) {
    if (!key.startsWith("_") || val === undefined || val === "" || val === 0 || val === "none") continue
    const cssProp = PROP_MAP[key.slice(1)]
    if (!cssProp) continue
    lines.push(`  ${cssProp}: ${cssProp === "opacity" ? `${(val as number) / 100}` : `${val}${PX_PROPS.has(cssProp) ? "px" : ""}`};`)
  }
  return lines.length ? `.section {\n${lines.join("\n")}\n}` : "/* no styles */"
}

function buildTW(props: Record<string, unknown>): string {
  const cls: string[] = []
  for (const [key, val] of Object.entries(props)) {
    if (!key.startsWith("_") || val === undefined || val === "" || val === 0) continue
    const name = key.slice(1)
    if (TW[name]?.[val as string | number]) { cls.push(TW[name][val as string | number]); continue }
    if (["backgroundColor", "textColor", "borderColor"].includes(name) && typeof val === "string") {
      const pre = name === "backgroundColor" ? "bg" : name === "textColor" ? "text" : "border"
      const tw = TW_COLORS[val.toLowerCase()]
      cls.push(tw ? `${pre}-${tw}` : `${pre}-[${val}]`)
    }
  }
  return cls.join(" ") || "/* no classes */"
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false)
  return <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500) }}>{ok ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{ok ? "Copied" : label}</Button>
}

function Sec({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <div><div className="flex items-center justify-between mb-1"><span className="text-[11px] font-medium">{title}</span>{action}</div>{children}</div>
}

function BoxModel({ props }: { props: Record<string, unknown> }) {
  const [mt, mb, pt, pb, pl, pr, bw] = [n(props, "marginTop"), n(props, "marginBottom"), n(props, "paddingTop"), n(props, "paddingBottom"), n(props, "paddingLeft"), n(props, "paddingRight"), n(props, "borderWidth")]
  return (
    <div className="text-[9px] text-center leading-tight bg-orange-200 dark:bg-orange-900/40 p-1 rounded">
      <div className="text-[8px] opacity-60">margin</div><div>{mt}</div>
      <div className="bg-yellow-200 dark:bg-yellow-900/40 p-1 rounded my-0.5">
        <div className="text-[8px] opacity-60">border {bw}</div>
        <div className="bg-green-200 dark:bg-green-900/40 p-1 rounded">
          <div className="text-[8px] opacity-60">padding</div>
          <div className="flex justify-between"><span>{pl}</span><div className="bg-blue-200 dark:bg-blue-900/40 px-3 py-1 rounded text-[8px]">content</div><span>{pr}</span></div>
          <div>{pt} / {pb}</div>
        </div></div><div>{mb}</div></div>
  )
}

function Colors({ props }: { props: Record<string, unknown> }) {
  const colors = (["backgroundColor", "textColor", "borderColor", "gradientFrom", "gradientTo"] as const).map((k) => g(props, k) as string | undefined).filter((v): v is string => !!v && v !== "none")
  if (!colors.length) return <span className="text-[10px] text-muted-foreground">No colors</span>
  return <div className="flex gap-1.5 flex-wrap">{colors.map((c) => <button key={c} onClick={() => navigator.clipboard.writeText(c)} title={c} className="size-6 rounded border border-border cursor-pointer hover:ring-2 ring-ring" style={{ backgroundColor: c }} />)}</div>
}

function Typo({ props }: { props: Record<string, unknown> }) {
  const items = ([["Font", "fontFamily"], ["Weight", "fontWeight"], ["Size", "fontSize"], ["Line-H", "lineHeight"], ["Spacing", "letterSpacing"], ["Align", "textAlign"]] as const).map(([l, k]) => [l, g(props, k)] as const).filter(([, v]) => v !== undefined && v !== "" && v !== "none")
  if (!items.length) return <span className="text-[10px] text-muted-foreground">No typography</span>
  return <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">{items.map(([k, v]) => <div key={k}><span className="text-muted-foreground">{k}:</span> {String(v)}</div>)}</div>
}

function Dims({ props }: { props: Record<string, unknown> }) {
  const w = g(props, "maxWidth") ?? "auto"
  return <div className="text-[10px] grid grid-cols-2 gap-x-4 gap-y-0.5"><div>Size: {String(w)} × auto</div><div>Pad: {n(props, "paddingTop") + n(props, "paddingBottom")}v {n(props, "paddingLeft") + n(props, "paddingRight")}h</div><div>Margin: {n(props, "marginTop") + n(props, "marginBottom")}v</div></div>
}

export function InspectPanel({ sectionId }: { sectionId: string }) {
  const props = useEditorStore((s) => s.sections.find((x) => x.id === sectionId)?.props ?? {})
  const css = buildCSS(props), tw = buildTW(props)
  return (
    <div className="p-3 flex flex-col gap-3">
      <Sec title="Computed CSS" action={<CopyBtn text={css} label="Copy CSS" />}><pre className="text-[11px] font-mono bg-muted/50 rounded-md p-3 overflow-auto whitespace-pre text-muted-foreground">{css}</pre></Sec>
      <Sec title="Tailwind Output" action={<CopyBtn text={tw} label="Copy TW" />}><pre className="text-[11px] font-mono bg-muted/50 rounded-md p-2 overflow-auto whitespace-pre-wrap text-muted-foreground">{tw}</pre></Sec>
      <Sec title="Box Model"><BoxModel props={props} /></Sec>
      <Sec title="Colors Used"><Colors props={props} /></Sec>
      <Sec title="Typography"><Typo props={props} /></Sec>
      <Sec title="Dimensions"><Dims props={props} /></Sec>
    </div>
  )
}
